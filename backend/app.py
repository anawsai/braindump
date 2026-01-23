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
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
        
        res = supabase.table("notes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
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
    user_id = body.get("user_id")  # Get user_id for tracking
    
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
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
            "insights": insights,
            "category": category,
            "user_id": user_id
        }
        res = supabase.table("notes").insert(insert_data).execute()

        if res.data and len(res.data) > 0:
            note_id = res.data[0]["id"]
            embedding_text = "[" + ",".join(map(str, embedding)) + "]"
            supabase.rpc(
                "update_note_embedding",
                {
                    "p_note_id": note_id,
                    "p_embedding_text": embedding_text
                }
            ).execute()
        
        # Track user activity if user_id provided
        if user_id:
            try:
                from datetime import datetime
                today = datetime.now().date().isoformat()
                
                # Update or insert daily activity
                existing = supabase.table("daily_activity")\
                    .select("*")\
                    .eq("user_id", user_id)\
                    .eq("activity_date", today)\
                    .execute()
                
                if existing.data:
                    # Increment count
                    supabase.table("daily_activity")\
                        .update({"dump_count": existing.data[0]["dump_count"] + 1})\
                        .eq("id", existing.data[0]["id"])\
                        .execute()
                else:
                    # Create new record
                    supabase.table("daily_activity")\
                        .insert({"user_id": user_id, "activity_date": today, "dump_count": 1})\
                        .execute()
                
                # Update streak and total dumps
                supabase.rpc("update_user_streak", {"p_user_id": user_id}).execute()
                
                # Update total_dumps count
                stats_res = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
                if stats_res.data and len(stats_res.data) > 0:
                    current_total = stats_res.data[0].get("total_dumps", 0)
                    supabase.table("user_stats")\
                        .update({"total_dumps": current_total + 1})\
                        .eq("user_id", user_id)\
                        .execute()
                    
            except Exception as track_error:
                # Don't fail the note creation if tracking fails
                print(f"Activity tracking error: {track_error}")
        
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
            embedding = model.encode(updates["content"]).tolist()
            
            # Don't include embedding in regular update - it won't work
            # Do it via RPC instead
            embedding_text = "[" + ",".join(map(str, embedding)) + "]"
            supabase.rpc(
                "update_note_embedding",
                {
                    "p_note_id": int(note_id),
                    "p_embedding_text": embedding_text
                }
            ).execute()
            
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

@app.post("/notes/<note_id>/complete")
def complete_task(note_id: str):
    """Mark a task as completed and increment user's tasks_completed counter"""
    try:
        from datetime import datetime
        
        # Get the note first to verify it exists
        note_res = supabase.table("notes").select("*").eq("id", note_id).single().execute()
        if not note_res.data:
            return jsonify({"error": "Note not found"}), 404
        
        note = note_res.data
        if note.get("is_completed"):
            return jsonify({"error": "Task already completed"}), 400
        
        # Mark task as completed
        update_res = supabase.table("notes").update({
            "is_completed": True,
            "is_task": True,  # Ensure it's marked as a task
            "completed_at": datetime.now().isoformat()
        }).eq("id", note_id).execute()
        
        if not update_res.data:
            return jsonify({"error": "Failed to update task"}), 500
        
        # Get user_id from the note to update their stats
        user_id = note.get("user_id")
        if user_id:
            try:
                # Get current stats
                stats_res = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
                
                if stats_res.data and len(stats_res.data) > 0:
                    # Increment tasks_completed
                    current_count = stats_res.data[0].get("tasks_completed", 0)
                    supabase.table("user_stats").update({
                        "tasks_completed": current_count + 1
                    }).eq("user_id", user_id).execute()
                else:
                    # Create stats if they don't exist
                    supabase.table("user_stats").insert({
                        "user_id": user_id,
                        "tasks_completed": 1,
                        "current_streak": 0,
                        "longest_streak": 0,
                        "total_dumps": 0
                    }).execute()
            except Exception as stats_error:
                print(f"Error updating stats: {stats_error}")
        
        return jsonify(update_res.data[0]), 200
        
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.post("/notes/<note_id>/uncomplete")
def uncomplete_task(note_id: str):
    """Mark a task as not completed and decrement user's tasks_completed counter"""
    try:
        # Get the note first
        note_res = supabase.table("notes").select("*").eq("id", note_id).single().execute()
        if not note_res.data:
            return jsonify({"error": "Note not found"}), 404
        
        note = note_res.data
        if not note.get("is_completed"):
            return jsonify({"error": "Task is not completed"}), 400
        
        # Mark task as not completed
        update_res = supabase.table("notes").update({
            "is_completed": False,
            "completed_at": None
        }).eq("id", note_id).execute()
        
        if not update_res.data:
            return jsonify({"error": "Failed to update task"}), 500
        
        # Decrement tasks_completed counter
        user_id = note.get("user_id")
        if user_id:
            try:
                stats_res = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
                
                if stats_res.data and len(stats_res.data) > 0:
                    current_count = stats_res.data[0].get("tasks_completed", 0)
                    new_count = max(0, current_count - 1)
                    supabase.table("user_stats").update({
                        "tasks_completed": new_count
                    }).eq("user_id", user_id).execute()
            except Exception as stats_error:
                print(f"Error updating stats: {stats_error}")
        
        return jsonify(update_res.data[0]), 200
        
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

# User Stats Endpoints
@app.get("/user/stats/<user_id>")
def get_user_stats(user_id: str):
    """Get user statistics including streak, total dumps, etc."""
    try:
        # Get user stats - don't use .single() since it errors on 0 rows
        stats_res = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
        
        # Check if user has stats already
        if not stats_res.data or len(stats_res.data) == 0:
            # Initialize stats if they don't exist
            init_data = {
                "user_id": user_id,
                "current_streak": 0,
                "longest_streak": 0,
                "total_dumps": 0,
                "tasks_completed": 0
            }
            stats_res = supabase.table("user_stats").insert(init_data).execute()
            return jsonify(stats_res.data[0] if stats_res.data else init_data), 200
        
        # Return existing stats
        return jsonify(stats_res.data[0]), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.get("/user/activity/<user_id>")
def get_user_activity(user_id: str):
    """Get user's daily activity for the past 7 days"""
    try:
        # Get activity for last 7 days
        from datetime import datetime, timedelta
        today = datetime.now().date()
        week_ago = today - timedelta(days=6)
        
        activity_res = supabase.table("daily_activity")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("activity_date", week_ago.isoformat())\
            .lte("activity_date", today.isoformat())\
            .execute()
        
        # Create a dict for the past 7 days
        activity_by_date = {}
        for i in range(7):
            date = week_ago + timedelta(days=i)
            activity_by_date[date.isoformat()] = {
                "date": date,
                "dump_count": 0
            }
        
        # Fill in actual activity counts
        for record in activity_res.data:
            date_str = record['activity_date']
            if date_str in activity_by_date:
                activity_by_date[date_str]["dump_count"] = record['dump_count']
        
        # Convert to list ordered by date
        activity_list = [
            {
                "date": info["date"].strftime("%a"),  # Day name (Mon, Tue, etc.)
                "dump_count": info["dump_count"]
            }
            for date_str, info in sorted(activity_by_date.items())
        ]
        
        return jsonify(activity_list), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.get("/user/achievements/<user_id>")
def get_user_achievements(user_id: str):
    """Get user's unlocked achievements"""
    try:
        achievements_res = supabase.table("user_achievements")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        # Convert to a more usable format
        unlocked = set(ach['achievement_type'] for ach in achievements_res.data)
        
        all_achievements = [
            {
                "type": "first_dump",
                "name": "First Dump",
                "icon": "download",
                "unlocked": "first_dump" in unlocked
            },
            {
                "type": "week_straight",
                "name": "Week Straight", 
                "icon": "flame",
                "unlocked": "week_straight" in unlocked
            },
            {
                "type": "task_complete",
                "name": "Task Complete",
                "icon": "checkmark",
                "unlocked": "task_complete" in unlocked
            }
        ]
        
        return jsonify(all_achievements), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.get("/notes/<note_id>/related")
def get_related_notes(note_id: str):
    """Find notes related to the given note based on semantic similarity"""
    try:
        user_id = request.args.get("user_id")
        match_count = int(request.args.get("match_count", 5))
        match_threshold = float(request.args.get("match_threshold", 0.3))
        
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
        
        print(f"\n{'='*60}")
        print(f"[DEBUG] Getting related notes for note {note_id}")
        
        # Get the source note info (don't need embedding, just metadata)
        note_res = supabase.table("notes").select("id, title, content, category").eq("id", note_id).single().execute()
        
        if not note_res.data:
            return jsonify({"error": "Note not found"}), 404
        
        target_note = note_res.data
        
        # Use RPC to get related notes (all vector math happens in PostgreSQL)
        try:
            related_res = supabase.rpc(
                "get_related_notes",
                {
                    "p_note_id": int(note_id),
                    "p_user_id": user_id,
                    "p_match_count": match_count,
                    "p_threshold": match_threshold
                }
            ).execute()
            
            related_notes = related_res.data or []
            
            print(f"[DEBUG] Found {len(related_notes)} related notes")
            for note in related_notes[:5]:
                print(f"  - Note {note['id']}: {note.get('title', 'Untitled')} - similarity: {note['similarity']:.3f}")
            
        except Exception as rpc_error:
            print(f"[ERROR] RPC call failed: {rpc_error}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Failed to get related notes: {str(rpc_error)}"}), 500
        
        print(f"{'='*60}\n")
        
        # Extract common themes
        try:
            themes = extract_common_themes(target_note, related_notes)
        except Exception as e:
            print(f"[ERROR] Error extracting themes: {e}")
            themes = []
        
        return jsonify({
            "source_note": target_note,
            "related_notes": related_notes,
            "common_themes": themes
        }), 200
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Unhandled exception:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def extract_common_themes(source_note, related_notes):
    """Extract common themes between source note and related notes"""
    try:
        if not related_notes:
            return []
        
        # Combine all content
        all_content = source_note.get("content", "") + " "
        all_content += " ".join([note.get("content", "") for note in related_notes])
        
        if not all_content.strip():
            return []
        
        # Simple keyword extraction
        try:
            from nltk.corpus import stopwords
            stop_words = set(stopwords.words('english'))
        except Exception as e:
            print(f"[WARN] NLTK stopwords not available: {e}")
            # Fallback to basic stopwords
            stop_words = set([
                'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
                'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
                'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
            ])
        
        words = re.findall(r'\b[a-z]{4,}\b', all_content.lower())
        
        # Count word frequencies
        word_counts = {}
        for word in words:
            if word not in stop_words:
                word_counts[word] = word_counts.get(word, 0) + 1
        
        # Get top themes (words appearing 2+ times)
        themes = sorted(
            [(word, count) for word, count in word_counts.items() if count >= 2],
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        return [word for word, _ in themes]
        
    except Exception as e:
        print(f"[ERROR] Error in extract_common_themes: {e}")
        return []
    
@app.get("/")
def home():
    return jsonify({"message": "Backend is running"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)))