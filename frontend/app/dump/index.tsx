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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { addNote, fetchNotes } from "../../lib/api";
import { useLoading } from '../../context/LoadingContext';
import { useTheme } from '../../context/ThemeContext';
import { checkForStressPatterns, getRecentDumpCount } from '../../lib/notifications';

export default function Notes() {
  const { colors } = useTheme();
  const [noteText, setNoteText] = useState("");
  const [savingMode, setSavingMode] = useState<'none' | 'save' | 'organize'>('none');
  const loading = useLoading();
  const [prompt, setPrompt] = useState("What's on your mind today>");

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    setPrompt(getRandomPrompt());
  }, []);

  async function saveNote() {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    try {
      setSavingMode('save');
      loading.start('Saving...');
      
      // Regular save - no AI organization
      await addNote('Untitled', noteText, undefined, false);
      
      // Check for stress patterns after saving
      await checkStressAfterDump();
      
      Alert.alert('Success', 'Note saved!');
      setNoteText('');
      dismissKeyboard();
    } catch (e:any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingMode('none');
      loading.stop();
    }
  }
  
  async function saveAndOrganize() {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    try {
      setSavingMode('organize');
      loading.start('Organizing...');
      
      // Organize mode - AI generates title and category
      await addNote('Untitled', noteText, undefined, true);
      
      // Check for stress patterns after saving
      await checkStressAfterDump();
      
      Alert.alert('Success', 'Note organized and saved!');
      setNoteText('');
      dismissKeyboard();
    } catch (e:any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingMode('none');
      loading.stop();
    }
  }

  async function checkStressAfterDump() {
    try {
      // Get all notes to check recent dump count
      const allNotes = await fetchNotes();
      const recentCount = await getRecentDumpCount(allNotes);
      
      // Check if stress alert should be sent
      await checkForStressPatterns(recentCount);
    } catch (error) {
      console.error('Error checking stress patterns:', error);
      // Don't show error to user, just log it
    }
  }

  const prompts: string[] = [
    "What's on your mind today?",
    "Are there any tasks you need to accomplish?",
    "What are some goals you have for the week?",
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
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }, (loading.active || savingMode !== 'none') && styles.dimmed]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

        {/* Mascot prompt */}
        <View style={styles.promptContainer}>
          <Image 
            source={require('../../assets/mascot.png')} 
            style={styles.mascotImage}
          />
          <Text style={[styles.promptText, { color: colors.text }]}>{prompt}</Text>
        </View>

        {/* Text input area */}
        <View style={[
          styles.inputContainer, 
          { 
            borderColor: colors.border, 
            backgroundColor: colors.input 
          },
          (loading.active || savingMode !== 'none') && styles.dimmed
        ]}>
          <TextInput
            placeholder="What's on your mind? Ideas, tasks, random thoughts, anything...."
            placeholderTextColor={colors.placeholder}
            multiline
            value={noteText}
            onChangeText={setNoteText}
            style={[styles.textInput, { color: colors.text }]}
            editable={!loading.active && savingMode === 'none'}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={saveNote}
            disabled={savingMode !== 'none' || loading.active}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {savingMode === 'save' ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={saveAndOrganize}
            disabled={savingMode !== 'none' || loading.active}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {savingMode === 'organize' ? 'Organizing...' : 'Save & Organize'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 4,
  },
  promptContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  mascotImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dimmed: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});