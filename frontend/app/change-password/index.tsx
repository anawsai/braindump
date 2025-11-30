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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={36} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change Password</Text>

        <TouchableOpacity>
          <Text style={styles.headerSave}>SAVE</Text>
        </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
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
    backgroundColor: "#F2A652",
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
