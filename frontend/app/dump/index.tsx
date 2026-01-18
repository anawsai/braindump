// Dump page (rename it later)
import React, { useEffect, useState, useRef } from "react";
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
import { useLoading } from '../../context/LoadingContext';

export default function Notes() {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const loading = useLoading();
  const [prompt, setPrompt] = useState("What's on your mind today>");

  useEffect(() => {
    setPrompt(getRandomPrompt());
  }, []);

  async function saveNote() {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    try {
      setSaving(true);
      loading.start('Saving...');
      // Regular save - no AI organization
      await addNote('Untitled', noteText, undefined, false);
      Alert.alert('Success', 'Note saved!');
      setNoteText('');
    } catch (e:any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
      loading.stop();
    }
  }
  
  async function saveAndOrganize() {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    try {
      setSaving(true);
      loading.start('Organizing...');
      // Organize mode - AI generates title and category
      await addNote('Untitled', noteText, undefined, true);
      Alert.alert('Success', 'Note organized and saved!');
      setNoteText('');
    } catch (e:any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
      loading.stop();
    }
  }

  const prompts: string[] = [
    "What's on your mind today?",
    "Are there any tasks you need to accomplish?",
    "What's are some goals you have for the week?",
    "What do you need to get off your chest?",
    "Is there something you've been procrastinating on?",
    "What makes you feel overwhelmed?",
    "What's the most creative thing you've done recently?",
    "Any idea is worth jotting down. What's yours?",
    "What are you grateful for today?",
    "What's a challenge you're facing right now?",
    "Did something good happen recently?",
  ]

  function getRandomPrompt(): string {
      const idx: number = Math.floor(Math.random() * prompts.length);
      return prompts[idx];
  }

  return (
    <View style={[styles.container, (loading.active || saving) && styles.dimmed]}>
      <StatusBar barStyle="dark-content" />

      {/* Loading screen overlay (visible during initial load or saving) */}
      {/* Global loader is rendered by LoadingProvider at the root. */}

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
        <Text style={styles.promptText}>{prompt}</Text>
      </View>

      {/* Text input area */}
      <View style={[styles.inputContainer, (loading.active || saving) && styles.dimmed]}>
        <TextInput
          placeholder="What's on your mind? Ideas, tasks, random thoughts, anything...."
          placeholderTextColor="#999"
          multiline
          value={noteText}
          onChangeText={setNoteText}
          style={styles.textInput}
          editable={!loading.active}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.button}
          onPress={saveNote}
          disabled={saving || loading.active}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={saveAndOrganize}
          disabled={saving || loading.active}
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
  dimmed: {
    opacity: 0.5,
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