import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotes } from "../../lib/api";
import { useTheme } from '../../context/ThemeContext';
import { useLoading } from '../../context/LoadingContext';

function timeAgo(timestamp?: string) {
  if (!timestamp) return "";

  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type Note = { 
  id?: string; 
  title?: string; 
  content?: string; 
  created_at?: string;
  is_completed?: boolean;
  is_task?: boolean;
  completed_at?: string;
};

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
  const { colors } = useTheme();
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const isOpen = openMenuId === item.id;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/note-detail/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.accent }]}>
        <View style={styles.cardHeader}>
          <View style={[
              styles.circleCheckbox,
              { borderColor: colors.text },
              item.is_completed && { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }
            ]}>
              {item.is_completed && (
                <Ionicons name="checkmark" size={14} color="#4CAF50" />
              )}
            </View>
            <Text style={[
              styles.cardTitle,
              { color: colors.text },
              item.is_completed && styles.cardTitleCompleted
            ]} numberOfLines={1}>
              {item.title || "Note Title"}
            </Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              setOpenMenuId(isOpen ? null : (item.id as string));
            }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.content}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{timeAgo(item.created_at)}</Text>
        </View>

        {isOpen && (
          <View
            style={[styles.dropdown, {
              backgroundColor: colors.primary,
              borderColor: colors.accent,
            }]}
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
              style={[
                styles.dropdownItem,
                { borderBottomColor: colors.accent },
                editHover && { backgroundColor: colors.background }
              ]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpenMenuId(null);
                onDelete(item.id);
              }}
              onHoverIn={() => setDeleteHover(true)}
              onHoverOut={() => setDeleteHover(false)}
              style={[
                styles.dropdownItem,
                { borderBottomColor: colors.accent },
                deleteHover && { backgroundColor: colors.background }
              ]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { start, stop } = useLoading();
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      async function load() {
        // Only show loading animation on first load
        if (!hasLoadedOnce) {
          start('Loading notes...');
        }
        
        try {
          const data = await fetchNotes();
          setNotes(data ?? []);
          setHasLoadedOnce(true);
        } catch (error) {
          console.error('Failed to fetch notes:', error);
        } finally {
          if (!hasLoadedOnce) {
            stop();
          }
        }
      }
      
      load();
    }, [hasLoadedOnce])
  );

  function handleDelete(id?: string) {
    if (!id) return;
    router.push({ pathname: "/delete-note/delete", params: { id } });
  }

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
    const todayStr = new Date().toDateString();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Notes</Text>

      {/* Search bar */}
      <View style={[styles.searchRow, { borderColor: colors.border }]}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search your thoughts..."
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
      </View>

      {/* Add + chips */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary, borderColor: colors.accent }]}
          onPress={() => router.push("/add-notes/add-notes")}
        >
          <Text style={[styles.addButtonText, { color: colors.text }]}>＋ Add Note</Text>
        </TouchableOpacity>

        <View style={styles.chipsRow}>
          <TouchableOpacity style={[styles.chip, styles.chipActive, { backgroundColor: colors.primary, borderColor: colors.accent }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>all ({allCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: colors.surfaceSecondary, borderColor: colors.accent }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>today ({todayCount})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => item.id ?? String(i)}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notes yet. Start dumping your thoughts!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NoteCard
            item={item}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onDelete={handleDelete}
          />
        )}
      />
    </View>  
  );
}           

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  heading: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  addButtonText: { fontWeight: "600", fontSize: 14 },
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipActive: {},
  chipText: { fontWeight: "600", fontSize: 12 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },

  card: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
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
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    marginLeft: "auto",
    padding: 8,
    borderRadius: 12,
  },
  cardTitle: { 
    fontWeight: "700", 
    fontSize: 16,
    flex: 1,
  },
  cardBody: {
    marginTop: 4,
  },
  cardContent: { fontSize: 14, lineHeight: 20 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  timestamp: { fontSize: 12 },

  dropdown: {
    position: "absolute",
    top: 40,
    right: 10,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 50,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },

  cardTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});