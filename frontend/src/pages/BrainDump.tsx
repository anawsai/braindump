import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BrainDump() {
  const [note, setNote] = useState("");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header row: hamburger + avatar */}
      <View style={styles.header}>
        <Ionicons name="menu" size={28} color="black" />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
      </View>

      {/* Prompt bubble */}
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>What makes you feel overwhelmed?</Text>
      </View>

      {/* Big text input area */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="What’s on your mind? Ideas, tasks, random thoughts, anything…."
          placeholderTextColor="#555"
          multiline
          value={note}
          onChangeText={setNote}
          style={styles.input}
        />
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.grayButton}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.grayButton}>
          <Text style={styles.buttonText}>Save & Organize</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// styles copied from Figma layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFB052", // Figma orange
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontWeight: "bold" },
  promptBox: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  promptText: {
    color: "black",
    fontWeight: "500",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    height: 250,
    backgroundColor: "#EDEDED",
    padding: 10,
  },
  input: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  grayButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "black",
    fontWeight: "600",
  },
});
