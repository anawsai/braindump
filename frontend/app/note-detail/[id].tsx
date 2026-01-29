import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchNoteById, completeTask, uncompleteTask } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";

export default function NoteDetail() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const handleShare = async () => {
    if (!note) return;

    const title = note.title || "Note";
    const text = `${title}\n\n${note.content || ""}`;

    if (Platform.OS === 'web') {
      const nav: any = navigator;

      if ((nav && typeof nav.share === 'function')) {
        try {
          await nav.share({
            title,
            text,
          });
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Sharing failed.");
        }
      } else {
        Alert.alert("Error", "Web Share API not supported in this browser.");
      }
    } else {
      try {
        await Share.share({
          title,
          message: text,
        });
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Sharing failed.");
      }
    }
  };

  useEffect(() => {
    if (!id) return;

    async function loadNote() {
      try {
        setLoading(true);
        const data = await fetchNoteById(String(id));
        setNote(data);
      } catch (e: any) {
        console.error("Failed to load note:", e);
        Alert.alert("Error", e.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Note not found</Text>
      </View>
    );
  }

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Note Title Section */}
        <View style={styles.titleSection}>
          <View style={[styles.titleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title || "Note Title"}</Text>
            <TouchableOpacity style={[styles.categoryBadge, { backgroundColor: colors.primary, borderColor: colors.border }]}>
              <Ionicons name="star" size={14} color={colors.icon} style={{ marginRight: 4 }} />
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {note.category || "Health"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Content */}
        <View style={[styles.contentSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.noteContent, { color: colors.text }]}>{note.content || "No content"}</Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{timeAgo(note.created_at)}</Text>
        </View>

        {/* Insights Section */}
        <View style={[styles.insightsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.insightsIconContainer}>
            <Ionicons name="bulb" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>Insights</Text>
          <View style={styles.insightsContent}>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {note.insights || "No insights generated yet"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/edit-notes/edit", params: { id } })}
        >
          <Ionicons name="create-outline" size={24} color={colors.icon} />
          <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.icon} />
          <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            try {
              if (note.is_completed) {
                await uncompleteTask(String(id));
              } else {
                await completeTask(String(id));
              }
              const updatedNote = await fetchNoteById(String(id));
              setNote(updatedNote);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to update task");
            }
          }}
        >
          <Ionicons 
            name={note.is_completed ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={note.is_completed ? colors.success : colors.icon} 
          />
          <Text style={[
            styles.actionText, 
            { color: note.is_completed ? colors.success : colors.text }
          ]}>
            {note.is_completed ? "Completed ✓" : "Mark Complete"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({pathname: "/related-notes", params: { id }})}>
          <Ionicons name="git-network-outline" size={24} color={colors.icon} />
          <Text style={[styles.actionText, { color: colors.text }]}>Related Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/delete-note/delete", params: { id } })}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 200,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    textAlign: "right",
  },
  insightsSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 100,
    alignItems: "center",
  },
  insightsIconContainer: {
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  insightsContent: {
    width: "100%",
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});