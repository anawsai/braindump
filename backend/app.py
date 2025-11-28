import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
        res = supabase.table("notes").insert(new_note, returning="representation").execute()
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
        res = supabase.table("notes").update(updates, returning="representation").eq("id", note_id).execute()
        if not res.data:
            return jsonify({"error": "Note not found"}), 404
        return jsonify(res.data[0]), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.delete("/notes/<note_id>")
def delete_note(note_id: str):
    try:
        res = supabase.table("notes").delete(returning="representation").eq("id", note_id).execute()
        if not res.data:
            return jsonify({"error": "Note not found"}), 404
        return jsonify({"success": True, "message": f"Note {note_id} deleted"}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)))


