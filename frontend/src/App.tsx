import React, { useEffect, useState } from "react";
import {View, Text, TextInput, Button, FlatList, ActivityIndicator } from "react-native";
import { fetchNotes, addNote } from "./lib/api";

type Note = { id?: string; title?: string; content?: string };

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchNotes();
      setNotes(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    if (!title && !content) return;
    await addNote(title || "Untitled", content || "");
    setTitle("");
    setContent("");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        BrainDump — Notes
      </Text>

      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
        />
        <TextInput
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
          multiline
        />
        <Button title="Add Note" onPress={onAdd} />
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {item.title || "Untitled"}
              </Text>
              <Text>{item.content}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
