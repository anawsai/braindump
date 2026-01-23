import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getRelatedNotes } from "../../lib/api";

type RelatedNote = {
  id: number;
  title: string;
  content: string;
  category: string;
  similarity: number;
  created_at: string;
};

type RelatedNotesData = {
  source_note: {
    id: number;
    title: string;
    content: string;
    category: string;
  };
  related_notes: RelatedNote[];
  common_themes: string[];
};

export default function RelatedNotes() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RelatedNotesData | null>(null);

  useEffect(() => {
    if (!id) {
      Alert.alert("Error", "No note ID provided");
      router.back();
      return;
    }

    loadRelatedNotes();
  }, [id]);

  async function loadRelatedNotes() {
    try {
      setLoading(true);
      const result = await getRelatedNotes(String(id), 5);
      setData(result);
    } catch (error: any) {
      console.error("Failed to load related notes:", error);
      Alert.alert("Error", error.message || "Failed to load related notes");
    } finally {
      setLoading(false);
    }
  }

  function getSimilarityColor(similarity: number): string {
    if (similarity >= 0.8) return "#4CAF50"; // High similarity - green
    if (similarity >= 0.6) return "#FFB052"; // Medium similarity - orange
    return "#FF8D05"; // Lower similarity - darker orange
  }

  function getSimilarityLabel(similarity: number): string {
    if (similarity >= 0.8) return "Very Related";
    if (similarity >= 0.6) return "Related";
    return "Somewhat Related";
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB052" />
        <Text style={styles.loadingText}>Finding related thoughts...</Text>
      </View>
    );
  }

  if (!data || data.related_notes.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerCenter}>Related Notes</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/mascot.png")}
            style={styles.mascot}
          />
          <Text style={styles.emptyTitle}>No Related Notes Found</Text>
          <Text style={styles.emptyText}>
            This note doesn't have any similar notes yet. As you add more notes, 
            we'll find connections between your thoughts!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerCenter}>Related Notes</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Note Summary */}
        <View style={styles.sourceNoteCard}>
          <Text style={styles.sectionLabel}>Currently Viewing</Text>
          <Text style={styles.sourceNoteTitle}>{data.source_note.title}</Text>
          <Text style={styles.sourceNoteContent} numberOfLines={2}>
            {data.source_note.content}
          </Text>
        </View>

        {/* Found Count */}
        <Text style={styles.foundText}>
          Found {data.related_notes.length} related thought{data.related_notes.length !== 1 ? 's' : ''}!
        </Text>

        <Image
          source={require("../../assets/mascot.png")}
          style={styles.mascot}
        />

        {/* Common Themes */}
        {data.common_themes.length > 0 && (
          <View style={styles.themesContainer}>
            <Text style={styles.themesTitle}>Common Themes</Text>
            <View style={styles.themesRow}>
              {data.common_themes.map((theme, idx) => (
                <View key={idx} style={styles.themeTag}>
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Related Note Cards */}
        {data.related_notes.map((note, idx) => (
          <TouchableOpacity
            key={note.id}
            style={styles.noteCard}
            onPress={() => router.push({ 
              pathname: "/note-detail/[id]", 
              params: { id: String(note.id) } 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title || "Untitled"}</Text>
              <View 
                style={[
                  styles.similarityBadge, 
                  { backgroundColor: getSimilarityColor(note.similarity) }
                ]}
              >
                <Text style={styles.similarityText}>
                  {Math.round(note.similarity * 100)}%
                </Text>
              </View>
            </View>

            <Text style={styles.noteBody} numberOfLines={3}>
              {note.content}
            </Text>

            <View style={styles.noteFooter}>
              <View style={styles.categoryBadge}>
                <Ionicons name="star" size={12} color="#000" />
                <Text style={styles.categoryText}>{note.category}</Text>
              </View>
              <Text style={styles.similarityLabel}>
                {getSimilarityLabel(note.similarity)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  headerCenter: {
    fontSize: 18,
    fontWeight: "700",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: "center",
  },

  sourceNoteCard: {
    width: "100%",
    backgroundColor: "#F7F4F1",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  sourceNoteTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  sourceNoteContent: {
    fontSize: 14,
    color: "#666",
  },

  foundText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
    fontWeight: "600",
  },

  mascot: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },

  themesContainer: {
    width: "100%",
    backgroundColor: "#FFDBB0",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 20,
  },

  themesTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  themesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  themeTag: {
    backgroundColor: "#FFB052",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#000",
  },

  themeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },

  noteCard: {
    width: "100%",
    backgroundColor: "#FFB052",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 16,
  },

  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 12,
  },

  similarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
  },

  similarityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  noteBody: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },

  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    gap: 4,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },

  similarityLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});