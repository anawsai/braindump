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

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_KEY:
    client = OpenAI(api_key=OPENAI_KEY)
    print(" OpenAI enabled")
else:
    client = None
    print(" OpenAI disabled - no API key")

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
    
    # Check if user wants AI to organize
    should_organize = body.get("organize", False)
    user_category = (body.get("category") or "").strip()
    
    if not new_note["title"] and not new_note["content"]:
        return jsonify({"error": "Empty note"}), 400
    
    try:
        # Create embedding (always do this - it's free/local)
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embedding = model.encode(new_note["content"]).tolist()

        # Only generate insights if organizing
        if should_organize:
            insights = generate_insights(new_note["content"])
            # Generate title if empty or "Untitled"
            if not new_note["title"] or new_note["title"] == "Untitled":
                new_note["title"] = generate_title(new_note["content"])
            # Always generate category in organize mode
            category = generate_category(new_note["content"])
        else:
            # Regular save: no insights, use defaults
            insights = None
            if not new_note["title"]:
                new_note["title"] = "Untitled"
            category = user_category if user_category else "Personal"
        
        insert_data = {
            **new_note,
            "embedding": embedding,
            "insights": insights,
            "category": category
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
    
    # Check if user wants to reorganize
    should_organize = data.get("organize", False)
    
    if not updates:
        return jsonify({"error": "No fields to update"}), 400
    try:
        if "content" in updates:
            model = SentenceTransformer("all-MiniLM-L6-v2")
            updates["embedding"] = model.encode(updates["content"]).tolist()
            
            # Only generate insights if organize mode
            if should_organize:
                updates["insights"] = generate_insights(updates["content"])
                updates["title"] = generate_title(updates["content"])
                updates["category"] = generate_category(updates["content"])
            # If regular save with content change, don't regenerate insights
        
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

def is_meaningful(text: str) -> bool:
    """Filter out junk, super short, or repetitive notes."""
    if len(text.strip()) < 3:
        return False

    stop_words = set(stopwords.words('english'))
    tokens = [t for t in re.findall(r"[a-zA-Z]+", text.lower()) if t not in stop_words]
    if len(tokens) == 0:
        return False

    if re.fullmatch(r"(.)\1{2,}", text.strip().lower()):
        return False

    return True

def give_advice(note_text: str):
    if not client:
        return {"error": "OpenAI not configured"}
    
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

@app.post("/advice")
def get_advice():
    data = request.get_json()
    note_text = data.get("text", "")

    if not note_text:
        return jsonify({"error": "missing note text"}), 400
    advice = give_advice(note_text)
    return jsonify({"advice": advice})

def generate_insights(note_text: str):
    if not client:
        return "OpenAI not configured"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
        You are a smart personal assistant that gathers insights from notes.
        Given the following note, produce 2-4 short insights that summarize the key ideas and 
        anything important that the user might have submitted. 
        - Keep advice short and clear.
        - Never just say insights for saying them, they must be meaningful.
        - Output as bullet points. Avoid repeating the original text.
        """
                },
                {"role": "user", "content": f"Note: {note_text}"}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating insights: {e}")
        return f"Error generating insights: {str(e)}"
    
def generate_category(note_text: str) -> str:
    """Generate a category for the note using AI"""
    if not client:
        return "Personal"  # default fallback
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a note categorization assistant.
                    Given a note, classify it into ONE of these categories:
                    - Health (fitness, diet, medical, wellness)
                    - Work (career, projects, meetings, deadlines)
                    - Personal (relationships, hobbies, home, family)
                    - Ideas (creative thoughts, brainstorming, inspiration)
                    - Tasks (to-dos, errands, action items)
                    - Learning (education, studying, courses, skills)

                    Respond with ONLY the category name, nothing else."""
                },
                {"role": "user", "content": f"Note: {note_text}"}
            ],
            max_tokens=10
        )
        category = response.choices[0].message.content.strip()
        
        # Validate it's one of our categories
        valid_categories = ["Health", "Work", "Personal", "Ideas", "Tasks", "Learning"]
        return category if category in valid_categories else "Personal"
    except Exception as e:
        print(f"Error generating category: {e}")
        return "Personal"
    
def generate_title(note_text: str) -> str:
    """Generate a short, descriptive title for the note"""
    if not client:
        return "Untitled"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a note title generator. 
                    Create a short, descriptive title (3-6 words max) that captures the main idea of the note.
                    Be specific and concise. Do not use quotes or punctuation at the end.
                    Examples:
                    - "Team Meeting Notes March 2024"
                    - "Grocery List for Weekend"
                    - "Ideas for Marketing Campaign"

                    Respond with ONLY the title, nothing else."""
                },
                {"role": "user", "content": f"Note content: {note_text}"}
            ],
            max_tokens=20
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating title: {e}")
        return "Untitled"

@app.get("/")
def home():
    return jsonify({"message": "Backend is running"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)))
