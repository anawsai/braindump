import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.get("/notes")
def get_notes():
    data = supabase.table("notes").select("*").execute()
    return jsonify(data.data)

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

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)
