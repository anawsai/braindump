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
<<<<<<< Updated upstream
    return jsonify({"ok": True})

@app.get("/notes/")
=======
    return jsonify({"ok": True}), 200

@app.get("/notes")
>>>>>>> Stashed changes
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


# get one specific note by ID
@app.get("/notes/<int:note_id>")
def get_note_by_id(note_id: int):
    # TODO: fetch a single note by ID
    id = request.args.get('id')
    if not id: 
        return jsonify({"Success" : False, "error": "Missing user_id"})
    
    data = supabase.table("notes").select("*").eq("id", note_id).single().execute()
    return jsonify({"success": True, "notes": data.data})

    # Use supabase.table("notes").select("*").eq("id", note_id).single().execute()
    #return jsonify({"message": f"TODO: return note with id {note_id}"})

# update a note by ID
@app.put("/notes/<int:note_id>")
def update_note(note_id: int):
    # TODO: update an existing note in Supabase
    
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    updates = {}
    if title is not None:
        updates["title"] = title
    if content is not None:
        updates["content"] = content

    response = supabase.table("notes").update(updates).eq("id", note_id).execute()

<<<<<<< Updated upstream
    
    return jsonify({"message": f"TODO: update note with id {note_id}"})

    
# delete a note by ID
@app.delete("/notes/<int:note_id>")
def delete_note(note_id: int):
    # TODO: delete a note from Supabase
    data = supabase.table("notes").delete().eq("id", note_id).execute()

    if not data.data:
        return jsonify({"error": "Not not found."})
    
    return jsonify({"message": f"TODO: delete note with id {note_id}"})

=======
>>>>>>> Stashed changes
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)

