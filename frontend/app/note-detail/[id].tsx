import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchNoteById } from "../../lib/api";

export default function NoteDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB052" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Note not found</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Note Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.noteTitle}>{note.title || "Note Title"}</Text>
            <TouchableOpacity style={styles.categoryBadge}>
              <Ionicons name="star" size={14} color="#000000" style={{ marginRight: 4 }} />
              <Text style={styles.categoryText}>
                {note.category || "Health"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Content */}
        <View style={styles.contentSection}>
          <Text style={styles.noteContent}>{note.content || "No content"}</Text>
          <Text style={styles.timestamp}>{timeAgo(note.created_at)}</Text>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsIconContainer}>
            <Ionicons name="bulb" size={32} color="#FFB052" />
          </View>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightsContent}>
            <Text style={styles.insightText}>
              • this connects your "blah blah" roadmap{"\n"}
              • suggested next steps: ...........
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/edit-notes/edit", params: { id } })}
        >
          <Ionicons name="create-outline" size={24} color="#000000" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#000000" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#000000" />
          <Text style={styles.actionText}>Create Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="git-network-outline" size={24} color="#000000" />
          <Text style={styles.actionText}>Related Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/delete-note/delete", params: { id } })}
        >
          <Ionicons name="trash-outline" size={24} color="#FF5500" />
          <Text style={[styles.actionText, { color: "#FF5500" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
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
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 16,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginRight: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB052",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#000000",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  contentSection: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 16,
    minHeight: 200,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  noteContent: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  insightsSection: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
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
    color: "#000000",
    marginBottom: 12,
  },
  insightsContent: {
    width: "100%",
  },
  insightText: {
    fontSize: 14,
    color: "#333333",
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
    color: "#000000",
    marginTop: 4,
    fontWeight: "500",
  },
});