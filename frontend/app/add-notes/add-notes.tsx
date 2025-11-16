import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function AddNote() {
  const router = useRouter();
  const [title, setTitle] = useState("Brainstorm");
  const [content, setContent] = useState("What if we implemented yadayada.....");
  const [category, setCategory] = useState("Health");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Note</Text>
        <TouchableOpacity>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>⭐</Text>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.organizeButton}>
            <Text style={styles.buttonText}>Organize</Text>
          </TouchableOpacity>
        </View>

        {/* Brain mascot */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascot}>🧠</Text>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
});