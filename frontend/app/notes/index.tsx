import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotes, addNote, deleteNote } from "../../lib/api";
import { useLoading } from '../../context/LoadingContext';

type Note = { id?: string; title?: string; content?: string };

export default function Dump() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const loading = useLoading();
  const [query, setQuery] = useState("");

  async function load() {
    loading.start('Loading notes...');
    setLoadingNotes(true);
    try {
      const data = await fetchNotes();
      setNotes(data ?? []);
    } finally {
      setLoadingNotes(false);
      loading.stop();
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    try {
      await deleteNote(id);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete note');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
    );
  }, [notes, query]);

  const todayNotes = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return notes.filter((n) => {
      // Assuming notes have a created_at or timestamp field
      // For now, we'll count all notes as "today" placeholder
      return true; // Replace with actual date logic when timestamps are available
    });
  }, [notes]);

  const allCount = notes.length;
  const todayCount = todayNotes.length;
  const upcomingCount = 0; // Placeholder - set when you have scheduled notes

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notes</Text>

      {/* Search bar with icons */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search your thoughts..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Controls: Add button + filter chips */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/edit-notes/edit")}>
          <Text style={styles.addButtonText}>＋ Add Note</Text>
        </TouchableOpacity>

        <View style={styles.chipsRow}>
          <TouchableOpacity style={[styles.chip, styles.chipActive]}>
            <Text style={styles.chipText}>all ({allCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>today ({todayCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>upcoming ({upcomingCount})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.circleCheckbox} />
                <Text style={styles.cardTitle}>{item.title || "Note Title"}</Text>
                <TouchableOpacity style={styles.menuButton}>
                  <Ionicons name="ellipsis-vertical" size={18} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardContent}>{item.content}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.timestamp}>5 mins ago</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  micIcon: { marginLeft: 8 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  addSection: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  multiline: { minHeight: 60 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#7A4C2B",
    borderRadius: 10,
    backgroundColor: "#f6f3f0",
  },
  cardTitle: { fontWeight: "700", marginBottom: 6 },
  cardContent: { color: "#333" },
  /* new styles */
  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  addButton: {
    backgroundColor: "#FFB052",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9731E",
  },
  addButtonText: { color: "#2b1a0d", fontWeight: "600" },
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: {
    backgroundColor: "#FFDAB3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C9731E",
  },
  chipActive: { backgroundColor: "#FFB052" },
  chipText: { color: "#2b1a0d", fontWeight: "600" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  circleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2b1a0d",
    marginRight: 12,
  },
  menuButton: { marginLeft: 'auto', padding: 14, borderRadius: 12},
  cardBody: { minHeight: 80 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerText: { fontSize: 12, color: "#111", marginLeft: 4 },
  timestamp: { fontSize: 12, color: "#777" },
});
