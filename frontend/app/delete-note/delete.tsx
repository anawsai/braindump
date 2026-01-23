import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { deleteNote } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";

export default function DeleteNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [deleting, setDeleting] = useState(false);

  const handleKeepIt = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!id) {
      Alert.alert("Error", "No note ID provided");
      return;
    }
  
    setDeleting(true);
    try {
      await deleteNote(String(id));
      Alert.alert("Success", "Note deleted successfully!");
      router.replace('/notes');
    } catch (err: any) {
      Alert.alert("Error deleting note", err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

      {/* Warning icon */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>!</Text>
        </View>
      </View>

      {/* Main message */}
      <Text style={[styles.mainText, { color: colors.text }]}>
        Are you sure you want to{'\n'}DELETE this NOTE ?
      </Text>

      {/* Info box */}
      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.text }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          All of your data in this note will be{'\n'}
          <Text style={styles.boldText}>permanently deleted.</Text>
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.keepButton, { backgroundColor: colors.card, borderColor: colors.text }]}
          onPress={handleKeepIt}
          disabled={deleting}
        >
          <Text style={[styles.keepButtonText, { color: colors.text }]}>Keep it!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton, 
            { backgroundColor: colors.error, borderColor: colors.text },
            deleting && styles.deleteButtonDisabled
          ]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={[styles.deleteButtonText, { color: colors.text }]}>
            {deleting ? "Deleting..." : "Delete"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 120,
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  boldText: {
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  keepButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: 22,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 22,
    fontWeight: '700',
  },
});