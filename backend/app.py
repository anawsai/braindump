import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.get("/notes/")
def get_notes():
    data = supabase.table("notes").select("*").execute()
    return jsonify(data.data)

@app.post("/notes/")
def create_note():
    body = request.get_json(force=True)
    new_note = {
        "title": body.get("title"),
        "content": body.get("content"),
        "user_id": body.get("user_id"),
    }
    data = supabase.table("notes").insert(new_note).execute()
    return jsonify(data.data), 201


@app.get("/notes/<int:note_id>")
def get_note_by_id(note_id: int):
    data = supabase.table("notes").select("*").eq("id", note_id).single().execute()
    return jsonify(data.data)

# update a note by ID
@app.put("/notes/<int:note_id>")
def update_note(note_id: int):
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    updates = {}
    if title is not None:
        updates["title"] = title
    if content is not None:
        updates["content"] = content

    response = supabase.table("notes").update(updates).eq("id", note_id).execute()
    
    if not response.data:
        return jsonify({"error": "Note not found"}), 404
    
    return jsonify(response.data[0])

    
# delete a note by ID
@app.delete("/notes/<int:note_id>")
def delete_note(note_id: int):
    data = supabase.table("notes").delete().eq("id", note_id).execute()

    if not data.data:
        return jsonify({"error": "Note not found"}), 404
    
    return jsonify({"success": True, "message": f"Note {note_id} deleted"})
