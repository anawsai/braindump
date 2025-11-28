import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotes, addNote, deleteNote } from "../../lib/api";
import { useLoading } from '../../context/LoadingContext';

function timeAgo(timestamp?: string) {
  if (!timestamp) return "";

  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // seconds

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type Note = { id?: string; title?: string; content?: string; created_at?: string };

function NoteCard({
  item,
  openMenuId,
  setOpenMenuId,
  onDelete,
}: {
  item: Note;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id?: string) => void;
}) {
  const router = useRouter();
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const isOpen = openMenuId === item.id;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/note-detail/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.circleCheckbox} />
          <Text style={styles.cardTitle}>{item.title || "Note Title"}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              setOpenMenuId(isOpen ? null : (item.id as string));
            }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardContent}>{item.content}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>{timeAgo(item.created_at)}</Text>
        </View>

        {isOpen && (
          <View
            style={{
              position: "absolute",
              top: 40,
              right: 16,
              backgroundColor: "#fff",
              borderWidth: 1,
            }}
          >
            <Pressable
              onPress={() => {
                setOpenMenuId(null);
                router.push({
                  pathname: "/edit-notes/edit",
                  params: { id: item.id },
                });
              }}
              onHoverIn={() => setEditHover(true)}
              onHoverOut={() => setEditHover(false)}
              style={{
                padding: 12,
                backgroundColor: editHover ? "#f0f0f0" : "#fff",
              }}
            >
              <Text>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpenMenuId(null);
                onDelete(item.id);
              }}
              onHoverIn={() => setDeleteHover(true)}
              onHoverOut={() => setDeleteHover(false)}
              style={{
                padding: 12,
                backgroundColor: deleteHover ? "#f0f0f0" : "#fff",
              }}
            >
              <Text>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function Dump() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const loading = useLoading();
  const [query, setQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function load() {
    loading.start("Loading notes...");
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
      Alert.alert("Error", e.message || "Failed to delete note");
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

  // 🔹 Only notes created *today* based on created_at
  const todayNotes = useMemo(() => {
    const todayStr = new Date().toDateString(); // e.g. "Tue Nov 26 2025"

    return notes.filter((note) => {
      if (!note.created_at) return false;
      const createdDate = new Date(note.created_at);
      return createdDate.toDateString() === todayStr;
    });
  }, [notes]);

  const allCount = notes.length;
  const todayCount = todayNotes.length;
  const upcomingCount = 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notes</Text>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search your thoughts..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Add + chips */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-notes/add-notes")}
        >
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

      {loadingNotes ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <NoteCard
              item={item}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  heading: { fontSize: 22, fontWeight: "700", marginBottom: 18 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },

  /* controls */
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#FFB052",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9731E",
  },
  addButtonText: { color: "#2b1a0d", fontWeight: "600", fontSize: 14 },
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

  /* cards */
  card: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#7A4C2B",
    borderRadius: 10,
    backgroundColor: "#f6f3f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  circleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2b1a0d",
    marginRight: 12,
  },
  menuButton: {
    marginLeft: "auto",
    padding: 10,
    borderRadius: 12,
  },
  cardTitle: { fontWeight: "700", fontSize: 16 },
  cardBody: {
    marginTop: 4,
  },
  cardContent: { color: "#333", fontSize: 14 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  timestamp: { fontSize: 12, color: "#777" },
});


