// Dump page (rename it later)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { addNote } from "../../lib/api";

export default function Notes() {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    try {
      setSaving(true);
      console.log("POST /notes via Flask");
      const row = await addNote('Untitled', noteText); // (title, content)
      console.log("Saved row:", row);
      Alert.alert('Success', 'Note saved!');
      setNoteText('');
    } catch (e:any) {
      console.error("Save failed:", e);
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }
  
  async function saveAndOrganize() {
    //for now, just save normally
    //categorization logic later
    await saveNote();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with avatar */}
      <View style={styles.header}>
        <View style={{ width: 28 }} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
      </View>

      {/* Mascot prompt */}
      <View style={styles.promptContainer}>
        <Image 
          source={require('../../assets/mascot.png')} 
          style={styles.mascotImage}
        />
        <Text style={styles.promptText}>What makes you feel overwhelmed?</Text>
      </View>

      {/* Text input area */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="What's on your mind? Ideas, tasks, random thoughts, anything...."
          placeholderTextColor="#999"
          multiline
          value={noteText}
          onChangeText={setNoteText}
          style={styles.textInput}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.button}
          onPress={saveNote}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={saveAndOrganize}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save & Organize'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFB052",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  promptContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  mascotImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#F5F5F5",
    marginBottom: 24,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
});