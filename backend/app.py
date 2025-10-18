import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

#initialize Flask app + allows CORS for frontend communication
app = Flask(__name__)
CORS(app)

# health check endpoint
@app.get("/health")
def health():
    return jsonify({"ok": True})

# get all notes
@app.get("/notes")
def get_notes():
    data = supabase.table("notes").select("*").execute()
    return jsonify(data.data)

#create a note
@app.post("/notes")
def create_note():
    body = request.get_json(force=True)
    new_note = {
        "title": body.get("title"),
        "content": body.get("content"),
        "user_id": body.get("user_id"),
    }
    data = supabase.table("notes").insert(new_note).execute()
    return jsonify(data.data), 201

# get one specific note by ID
@app.get("/notes/<int:note_id>")
def get_note_by_id(note_id: int):
    # TODO: fetch a single note by ID
    # Use supabase.table("notes").select("*").eq("id", note_id).single().execute()
    return jsonify({"message": f"TODO: return note with id {note_id}"})

# update a note by ID
@app.put("/notes/<int:note_id>")
def update_note(note_id: int):
    # TODO: update an existing note in Supabase
    # ex: supabase.table("notes").update({...}).eq("id", note_id).execute()
    return jsonify({"message": f"TODO: update note with id {note_id}"})

# delete a note by ID
@app.delete("/notes/<int:note_id>")
def delete_note(note_id: int):
    # TODO: delete a note from Supabase
    # ex: supabase.table("notes").delete().eq("id", note_id).execute()
    return jsonify({"message": f"TODO: delete note with id {note_id}"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)
