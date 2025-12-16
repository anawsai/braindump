import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Change Password</Text>
      </View>

      {/* Current Password */}
      <Text style={styles.label}>Current password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Enter your current password"
        placeholderTextColor="#9CA3AF"
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      {/* New Password */}
      <Text style={styles.label}>New password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Enter your current password"
        placeholderTextColor="#9CA3AF"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {/* Requirements Box */}
      <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>Password must contain:</Text>

        <Text style={styles.rule}>✓ At least 8 characters</Text>
        <Text style={styles.rule}>✓ One uppercase letter</Text>
        <Text style={styles.rule}>✗ One lowercase letter</Text>
        <Text style={styles.rule}>✓ One number</Text>
        <Text style={styles.rule}>✗ One special character</Text>
      </View>

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm new password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Re-enter your current password"
        placeholderTextColor="#9CA3AF"
        value={confirm}
        onChangeText={setConfirm}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.bottomSave}>
        <Text style={styles.bottomSaveText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
    height: 44,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  headerSave: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: "#000",
    borderWidth: 1,
    marginBottom: 20,
  },

  rulesBox: {
    backgroundColor: "#D9D9D9",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 30,
  },

  rulesTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },

  rule: {
    fontSize: 14,
    marginBottom: 4,
  },

  bottomSave: {
    backgroundColor: "#FFB052",
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },

  bottomSaveText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
