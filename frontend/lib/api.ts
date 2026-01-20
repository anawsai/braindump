const API = "http://localhost:5001";

import { supabase } from "./supabase";

export async function fetchNotes() {
  const res = await fetch(`${API}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function addNote(
  title: string, 
  content: string, 
  category?: string,
  organize?: boolean
) {
  // Get current user for activity tracking
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = user?.id;

  const res = await fetch(`${API}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, category, organize, user_id }),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

// fetch a single note by ID (calls GET /notes/:id)
export async function fetchNoteById(id: string) {
  const res = await fetch(`${API}/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

// update a note by ID (calls PUT /notes/:id)
export async function updateNote(
  id: string,
  updates: { 
    title?: string; 
    content?: string; 
    category?: string;
    organize?: boolean;
  }
) {
  const res = await fetch(`${API}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// delete a note by ID (calls DELETE /notes/:id)
export async function deleteNote(id: string) {
  const res = await fetch(`${API}/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
}

export async function getAdvice(title: string, content: string) {
  const res = await fetch(`${API}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  const data = await res.json();
  return data.advice
}

export async function getRelatedNotes(id:string, count = 5) {
  const {data, error} = await await supabase.rpc("related_notes", {
    target_id: id,
    match_count: count
  });

  if (error) {
    console.error("Related notes error:", error);
    return [];
  }
  return data;
}

// Get notes from the last 7 days
export async function getWeeklyNotes() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const res = await fetch(`${API}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  const allNotes = await res.json();
  
  // Filter to only notes from last week
  return allNotes.filter((note: any) => {
    const noteDate = new Date(note.created_at);
    return noteDate >= oneWeekAgo;
  });
}

// Extract themes and keywords from note content
function extractThemes(notes: any[]): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
    'its', 'our', 'their', 'me', 'him', 'us', 'them', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through', 'during',
    'need', 'get', 'going', 'really', 'want', 'think', 'know', 'feel'
  ]);

  const wordCounts: Record<string, number> = {};
  
  notes.forEach(note => {
    const text = `${note.title || ''} ${note.content || ''}`.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) || []; // Words 4+ letters
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // Get top themes (words mentioned 2+ times)
  const themes = Object.entries(wordCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return themes;
}

// Analyze weekly notes for insights
export function analyzeWeeklyNotes(notes: any[]) {
  const categoryCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {
    'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
  };
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  notes.forEach(note => {
    // Count by category
    const category = note.category || 'Personal';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    // Count by day
    const noteDate = new Date(note.created_at);
    const dayName = dayNames[noteDate.getDay()];
    dailyCounts[dayName]++;
  });
  
  // Calculate category percentages
  const totalNotes = notes.length;
  const categoryPercentages = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    percentage: totalNotes > 0 ? Math.round((count / totalNotes) * 100) : 0
  }));
  
  // Sort by percentage descending
  categoryPercentages.sort((a, b) => b.percentage - a.percentage);
  
  // Get top category for summary
  const topCategory = categoryPercentages[0];
  
  // Extract themes from content
  const themes = extractThemes(notes);
  
  return {
    totalNotes,
    categoryCounts,
    categoryPercentages,
    dailyCounts,
    topCategory,
    themes,
    notes // Include the actual notes for deeper analysis
  };
}

// User Stats API calls
export async function getUserStats(userId: string) {
  const res = await fetch(`${API}/user/stats/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user stats");
  return res.json();
}

export async function getUserActivity(userId: string) {
  const res = await fetch(`${API}/user/activity/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user activity");
  return res.json();
}

export async function getUserAchievements(userId: string) {
  const res = await fetch(`${API}/user/achievements/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user achievements");
  return res.json();
}