import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function DeleteAccount() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleKeepIt = () => {
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: actuallyDelete }
      ]
    );
  };

  const actuallyDelete = async () => {
    try {
      setDeleting(true);

      // TODO: Replace with secure RPC / Edge Function
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Alert.alert("Account Deleted", "Your account has been deleted.");
      router.replace("/login");

    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to delete account.");
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
        Are you sure you want to{"\n"}DELETE this ACCOUNT ?
      </Text>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          All of your account data will be{"\n"}
          <Text style={styles.boldText}>permanently deleted.</Text>
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.keepButton}
          onPress={handleKeepIt}
          disabled={deleting}
        >
          <Text style={styles.keepButtonText}>Keep Account!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 35,
    paddingBottom: 35,
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
    paddingHorizontal: 10,
    width: '60%',
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
    width: '60%',
    gap: 16,
    marginBottom: 20,
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

