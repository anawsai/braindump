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

export default function DeleteNote() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get note ID from URL params
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
      const response = await fetch(`http://localhost:8081/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete note');
      }

      Alert.alert("Success", "Note deleted successfully!");
      router.replace('/notes'); // Go back to notes list
    } catch (err: any) {
      Alert.alert("Error deleting note", err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Warning icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>!</Text>
        </View>
      </View>

      {/* Main message */}
      <Text style={styles.mainText}>
        Are you sure you want to{'\n'}DELETE this NOTE ?
      </Text>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          All of your data in this note will be{'\n'}
          <Text style={styles.boldText}>permanently deleted.</Text>
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonRow}>
<<<<<<< HEAD
        <TouchableOpacity 
          style={styles.keepButton} 
=======
        <TouchableOpacity
          style={styles.keepButton}
>>>>>>> 44444eca6991fdff35ef62645a9344745764ff21
          onPress={handleKeepIt}
          disabled={deleting}
        >
          <Text style={styles.keepButtonText}>Keep it!</Text>
        </TouchableOpacity>
<<<<<<< HEAD
        
        <TouchableOpacity 
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]} 
=======

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
>>>>>>> 44444eca6991fdff35ef62645a9344745764ff21
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
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
    backgroundColor: '#FFB052',
<<<<<<< HEAD
    paddingHorizontal: 40,
    paddingVertical: 60,
=======
    paddingHorizontal: 16,
    paddingVertical: 16,
>>>>>>> 44444eca6991fdff35ef62645a9344745764ff21
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
    backgroundColor: '#723F08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFB052',
  },
  mainText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#502900',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  infoBox: {
    backgroundColor: '#F8D5AB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#502900',
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 18,
    color: '#502900',
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
    backgroundColor: '#F8D5AB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#502900',
    paddingVertical: 18,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#502900',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF5500',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#502900',
    paddingVertical: 18,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#502900',
  },
});