import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { addNote, fetchNoteById, updateNote } from "../../lib/api";

const CATEGORIES = ["Health", "Work", "Personal", "Ideas", "Tasks", "Learning"];

export default function EditNote() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Health");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoadingNote] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;

    async function loadNote() {
      try {
        setLoadingNote(true);
        const note = await fetchNoteById(String(id));
        setTitle(note.title || "");
        setContent(note.content || "");
        if (note.category) setCategory(note.category);
      } catch (e: any) {
        console.error("Failed to load note", e);
        Alert.alert("Error", e.message || "Failed to load note");
      } finally {
        setLoadingNote(false);
      }
    }

    loadNote();
  }, [id, isEditing]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
      await updateNote(String(id), {
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await addNote(title.trim(), content.trim());
        Alert.alert("Success", "Note created successfully");}

        setTitle("");
        setContent("");
        setCategory("Health");
        router.replace('/notes');
    } catch (e: any) {
      console.error("Failed to save note", e);
      Alert.alert("Error", e.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  }
  async function handleOrganize() {
    // For now, organize just saves the note
    await handleSave();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Title Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
                  <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="#999999"
              value={title}
              onChangeText={setTitle}
            />
            <TouchableOpacity
              style={styles.categoryBadge}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Ionicons name="star" size={14} color="#000000" style={{ marginRight: 4 }} />
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          </View>
      </View>

      {/* Content Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="What's the plan for today...."
          placeholderTextColor="#999999"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.organizeButton}
            onPress={handleOrganize}
            disabled={saving}
          >
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Organize'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryItemText}>{item}</Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#FFB052" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeIcon: {
    fontSize: 28,
    fontWeight: "300",
    color: "#000000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFDBB0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
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
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  contentInput: {
    backgroundColor: "#FFDBB0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 16,
    fontSize: 16,
    color: "#000000",
    minHeight: 250,
    marginBottom: 120,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FFDBB0",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 16,
    alignItems: "center",
  },
  organizeButton: {
    flex: 1,
    backgroundColor: "#FFB052",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  mascotContainer: {
    alignItems: "center",
  },
  mascot: {
    fontSize: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryItemSelected: {
    backgroundColor: "#FFF5E6",
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
});