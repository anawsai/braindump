import os
import hdbscan
import re
from nltk.tokenize import word_tokenize
from sentence_transformers import SentenceTransformer
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from openai.types.chat import ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam
from typing import Dict, Any, cast
from nltk.corpus import stopwords
import numpy as np

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"ok": True}), 200

@app.get("/notes")
def get_notes():
    try:
        res = supabase.table("notes").select("*").order("created_at", desc=True).execute()
        return jsonify(res.data), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.post("/notes")
def create_note():
    body = request.get_json(force=True) or {}
    new_note = {
        "title": (body.get("title") or "").strip(),
        "content": (body.get("content") or "").strip(),
    }
    if not new_note["title"] and not new_note["content"]:
        return jsonify({"error": "Empty note"}), 400
    try:
        embedding = embed_cluster_notes(new_note["content"])
        insights = generate_insights(new_note["content"])
        insert_data = {
            **new_note,
            "embedding": embedding,
            "insights": insights
        }
        res = supabase.table("notes").insert(insert_data).execute()
        return jsonify(res.data[0] if res.data else {}), 201
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.get("/notes/<note_id>")
def get_note_by_id(note_id: str):
    try:
        res = supabase.table("notes").select("*").eq("id", note_id).single().execute()
        if not res.data:
            return jsonify({"error": "Note not found"}), 404
        return jsonify(res.data), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.put("/notes/<note_id>")
def update_note(note_id: str):
    data = request.get_json(silent=True) or {}
    updates = {}
    if "title" in data:   updates["title"]   = (data["title"] or "").strip()
    if "content" in data: updates["content"] = (data["content"] or "").strip()
    if "category" in data: updates["category"] = (data["category"] or "").strip() 
    if not updates:
        return jsonify({"error": "No fields to update"}), 400
    try:
        if "content" in updates:
            new_update = updates["content"]
            updates["embedding"] = embed_cluster_notes(new_update)
            updates["insights"] = generate_insights(new_update)
        res = supabase.table("notes").update(updates).eq("id", note_id).execute()
        if not res.data:
            return jsonify({"error": "Note not found"}), 404
        return jsonify(res.data[0]), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.delete("/notes/<note_id>")
def delete_note(note_id: str):
    try:
        res = supabase.table("notes").delete().eq("id", note_id).execute()
        if not res.data:
            return jsonify({"error": "Note not found"}), 404
        return jsonify({"success": True, "message": f"Note {note_id} deleted"}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def embed_cluster_notes(get_notes):
    notes_data = get_notes()
    notes = []

    if isinstance(notes_data, tuple) and len(notes_data) == 2:
        notes_data = notes_data[0]

        # If response is a dict like {"data":[...]}
    if isinstance(notes_data, dict) and "data" in notes_data:
        notes_list = notes_data["data"]
    else:
        notes_list = notes_data

    for item in notes_list:
        text = item.get("content") or item.get("title") or ""
        if text.strip() and is_meaningful(text):
            notes.append({"id": item["id"], "text": text})
    # notes = ["This is a great product!", "I love using this service."]
    n_clusters: int = 10
    model_name = "all-MiniLM-L6-v2"
    model = SentenceTransformer(model_name)

    texts = [n["text"] for n in notes]
    embeddings = model.encode(texts, show_progress_bar=False)
    embeddings_list = [emb.tolist() for emb in embeddings]

    

    for note, embed in zip(notes, embeddings_list): 
        # supabase.table("notes").update({"embedding": embed}).eq("id", note["id"]).execute()
        update_embed = supabase.table("notes").update({"embedding": embed}).eq("id", note["id"]).execute()
        print("[EMBEDDING UPDATE]", note["id"], update_embed)

    hdbscan_model = hdbscan.HDBSCAN(min_cluster_size=2, min_samples=1, metric='euclidean')
    labels = hdbscan_model.fit_predict(embeddings)
    for note, label in zip(notes, labels):
        supabase.table("notes").update({"cluster": int(label)}).eq("id", note["id"]).execute()

    note_to_cluster = {notes[i]["ic"]: int(labels[i]) for i in range(len(notes))}
    return note_to_cluster


def is_meaningful(text: str) -> bool:
    """Filter out junk, super short, or repetitive notes."""
    if len(text.strip()) < 3:
        return False

    stop_words = set(stopwords.words('english'))
    # Remove stop words and check if what's left has substance
    tokens = [t for t in re.findall(r"[a-zA-Z]+", text.lower()) if t not in stop_words]
    if len(tokens) == 0:
        return False

    # Skip texts that are just repeated characters or nonsense like 'fffff'
    if re.fullmatch(r"(.)\1{2,}", text.strip().lower()):
        return False

    return True


def give_advice(note_text: str): #most probably for recommendations on review page
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
            You are a smart personal productivity assistant.
            - Extract tasks from the user's notes.
            - Decide the best task to do first based on urgency or importance.
            - If nothing to do, say "No tasks found."
            - Keep advice short and clear.
            - Never invent impossible tasks (only use what the user mentioned).
            Respond as JSON with:
            {
            "tasks": [ ... ],
            "recommended_task": "...",
            "reason": "..."
            }
            """
                },
                {"role": "user", "content": note_text}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content
    except Exception as e:
        return {"error": str(e)}


def get_advice():
    data = request.get_json()
    note_text = data.get("text", "")

    if not note_text:
        return jsonify({"error": "missing note text"}), 400
    advice = give_advice(note_text)
    return jsonify({"advice": advice})
def get_notes_raw():
    try:
        res = supabase.table("notes").select("*").execute()
        return res.data
    except Exception as e:
        return []

def get_actual_notes():
    try:
        res = supabase.table("notes").select("*").execute()
        return res.data
    except Exception as e:
        return []

def generate_insights(note_text:str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
        You are a smart personal assistant that gathers insights from notes.
        Given the following note, produce 2-4 short insights that summarize the key ideas and 
        anything important that the user might have submitted. 
        Note : {note_text}
        - Keep advice short and clear.
        - Never just say insights for saying them, they must be meaningful.
        - Output as bullet points. Avoid repeating the original text.
        }
        """
            }
        ],
        max_tokens=200
    )
    return response.choices[0].message.content

def save_insights(note_id: str, note: str):
    insights = generate_insights(note)
    res = supabase.table("notes").insert({"text": note,"insights": insights }).execute()
    return res

@app.get("/")
def home():
    return jsonify({"message": "Backend is running"}), 200

if __name__ == "__main__":
    # embed_cluster_notes(get_notes_raw)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)))
