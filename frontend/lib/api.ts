const API = "http://localhost:5001";

export async function fetchNotes() {
  const res = await fetch(`${API}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function addNote(title: string, content: string) {
  const res = await fetch(`${API}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
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
  updates: { title?: string; content?: string; category?: string}
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