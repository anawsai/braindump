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
      router.replace('/notes');
    } catch (err: any) {
      Alert.alert("Error deleting note", err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="dark-content" />

      {/* Warning icon */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryDark }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>!</Text>
        </View>
      </View>

      {/* Main message */}
      <Text style={[styles.mainText, { color: '#1A1A1A' }]}>
        Are you sure you want to{'\n'}DELETE this NOTE?
      </Text>

      {/* Info box */}
      <View style={[styles.infoBox, { backgroundColor: '#FFFFFF', borderColor: '#1A1A1A' }]}>
        <Text style={[styles.infoText, { color: '#1A1A1A' }]}>
          All of your data in this note will be{'\n'}
          <Text style={styles.boldText}>permanently deleted.</Text>
        </Text>
      </View>

      {/* Spacer to push buttons toward bottom */}
      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.keepButton, { backgroundColor: '#FFFFFF', borderColor: '#1A1A1A' }]}
          onPress={handleKeepIt}
          disabled={deleting}
        >
          <Text style={[styles.keepButtonText, { color: '#1A1A1A' }]}>Keep it!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton, 
            { backgroundColor: '#FF4444', borderColor: '#1A1A1A' },
            deleting && styles.deleteButtonDisabled
          ]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={[styles.deleteButtonText, { color: '#FFFFFF' }]}>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 100,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  mainText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  infoBox: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 60,
  },
  keepButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});