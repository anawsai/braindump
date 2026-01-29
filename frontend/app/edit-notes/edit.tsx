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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { addNote, fetchNoteById, updateNote } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";

const CATEGORIES = ["Health", "Work", "Personal", "Ideas", "Tasks", "Learning"];

export default function EditNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Health");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [savingMode, setSavingMode] = useState<'none' | 'save' | 'organize'>('none');
  const [loading, setLoadingNote] = useState(isEditing);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
    if (!content.trim()) {
      Alert.alert('Error', 'Please write some content');
      return;
    }

    setSavingMode('save');
    dismissKeyboard();
    try {
      if (isEditing) {
        await updateNote(String(id), {
          title: title.trim() || "Untitled",
          content: content.trim(),
          category: category,
          organize: false
        });
      } else {
        await addNote(title.trim() || "Untitled", content.trim(), category, false);
      }
      
      setTitle("");
      setContent("");
      setCategory("Health");
      router.replace('/notes');
    } catch (e: any) {
      console.error("Failed to save note", e);
      Alert.alert("Error", e.message || "Failed to save note");
    } finally {
      setSavingMode('none');
    }
  }

  async function handleOrganize() {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write some content');
      return;
    }

    setSavingMode('organize');
    dismissKeyboard();
    try {
      if (isEditing) {
        await updateNote(String(id), {
          content: content.trim(),
          organize: true
        });
      } else {
        await addNote(title.trim() || "Untitled", content.trim(), undefined, true);
      }
      
      setTitle("");
      setContent("");
      setCategory("Health");
      router.replace('/notes');
    } catch (e: any) {
      console.error("Failed to organize note", e);
      Alert.alert("Error", e.message || "Failed to organize note");
    } finally {
      setSavingMode('none');
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Note</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <View style={[styles.titleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.titleInput, { color: colors.text }]}
                placeholder="Title"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />
              <TouchableOpacity
                style={[styles.categoryBadge, { backgroundColor: colors.primary, borderColor: colors.border }]}
                onPress={() => {
                  dismissKeyboard();
                  setShowCategoryPicker(true);
                }}
              >
                <Ionicons name="star" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Content</Text>
            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="What's the plan for today...."
              placeholderTextColor={colors.placeholder}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.bottomSection, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleSave}
              disabled={savingMode !== 'none'}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>{savingMode === 'save' ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.organizeButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
              onPress={handleOrganize}
              disabled={savingMode !== 'none'}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>{savingMode === 'organize' ? 'Organizing...' : 'Organize'}</Text>
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
          <TouchableWithoutFeedback onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                      <Ionicons name="close" size={24} color={colors.icon} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.categoryItem,
                          { borderBottomColor: colors.border },
                          category === item && { backgroundColor: colors.surface },
                        ]}
                        onPress={() => {
                          setCategory(item);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={[styles.categoryItemText, { color: colors.text }]}>{item}</Text>
                        {category === item && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 140,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
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
  contentInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 250,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 16,
    alignItems: "center",
  },
  organizeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});