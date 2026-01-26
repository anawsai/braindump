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
import { useTheme } from "../../context/ThemeContext";

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
  const { colors } = useTheme();
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
    if (similarity >= 0.8) return colors.success;
    if (similarity >= 0.6) return colors.primary;
    return colors.primaryDark;
  }

  function getSimilarityLabel(similarity: number): string {
    if (similarity >= 0.8) return "Very Related";
    if (similarity >= 0.6) return "Related";
    return "Somewhat Related";
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding related thoughts...</Text>
      </View>
    );
  }

  if (!data || data.related_notes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerCenter, { color: colors.text }]}>Related Notes</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/mascot_dump.png")}
            style={styles.mascot}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Related Notes Found</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            This note doesn't have any similar notes yet. As you add more notes, 
            we'll find connections between your thoughts!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerCenter, { color: colors.text }]}>Related Notes</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Note Summary */}
        <View style={[styles.sourceNoteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Currently Viewing</Text>
          <Text style={[styles.sourceNoteTitle, { color: colors.text }]}>{data.source_note.title}</Text>
          <Text style={[styles.sourceNoteContent, { color: colors.textSecondary }]} numberOfLines={2}>
            {data.source_note.content}
          </Text>
        </View>

        {/* Found Count */}
        <Text style={[styles.foundText, { color: colors.text }]}>
          Found {data.related_notes.length} related thought{data.related_notes.length !== 1 ? 's' : ''}!
        </Text>

        <Image
          source={require("../../assets/mascot.png")}
          style={styles.mascot}
        />

        {/* Common Themes */}
        {data.common_themes.length > 0 && (
          <View style={[styles.themesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.themesTitle, { color: colors.text }]}>Common Themes</Text>
            <View style={styles.themesRow}>
              {data.common_themes.map((theme, idx) => (
                <View key={idx} style={[styles.themeTag, { backgroundColor: colors.primary, borderColor: colors.border }]}>
                  <Text style={[styles.themeText, { color: colors.text }]}>{theme}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Related Note Cards */}
        {data.related_notes.map((note, idx) => (
          <TouchableOpacity
            key={note.id}
            style={[styles.noteCard, { backgroundColor: colors.primary, borderColor: colors.border }]}
            onPress={() => router.push({ 
              pathname: "/note-detail/[id]", 
              params: { id: String(note.id) } 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.noteHeader}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title || "Untitled"}</Text>
              <View 
                style={[
                  styles.similarityBadge, 
                  { backgroundColor: getSimilarityColor(note.similarity), borderColor: colors.border }
                ]}
              >
                <Text style={styles.similarityText}>
                  {Math.round(note.similarity * 100)}%
                </Text>
              </View>
            </View>

            <Text style={[styles.noteBody, { color: colors.text }]} numberOfLines={3}>
              {note.content}
            </Text>

            <View style={styles.noteFooter}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="star" size={12} color={colors.icon} />
                <Text style={[styles.categoryText, { color: colors.text }]}>{note.category}</Text>
              </View>
              <Text style={[styles.similarityLabel, { color: colors.textSecondary }]}>
                {getSimilarityLabel(note.similarity)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
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
  },

  foundText: {
    fontSize: 16,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  themeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  noteCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },

  similarityLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});