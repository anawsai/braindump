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
import { useTheme } from "../../context/ThemeContext";

export default function ChangePassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} pointerEvents="none">Change Password</Text>
      </View>

      {/* Current Password */}
      <Text style={[styles.label, { color: colors.text }]}>Current password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        secureTextEntry
        placeholder="Enter your current password"
        placeholderTextColor={colors.placeholder}
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      {/* New Password */}
      <Text style={[styles.label, { color: colors.text }]}>New password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        secureTextEntry
        placeholder="Enter your new password"
        placeholderTextColor={colors.placeholder}
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {/* Requirements Box */}
      <View style={[styles.rulesBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.rulesTitle, { color: colors.text }]}>Password must contain:</Text>

        <Text style={[styles.rule, { color: colors.text }]}>✓ At least 8 characters</Text>
        <Text style={[styles.rule, { color: colors.text }]}>✓ One uppercase letter</Text>
        <Text style={[styles.rule, { color: colors.text }]}>✗ One lowercase letter</Text>
        <Text style={[styles.rule, { color: colors.text }]}>✓ One number</Text>
        <Text style={[styles.rule, { color: colors.text }]}>✗ One special character</Text>
      </View>

      {/* Confirm Password */}
      <Text style={[styles.label, { color: colors.text }]}>Confirm new password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        secureTextEntry
        placeholder="Re-enter your new password"
        placeholderTextColor={colors.placeholder}
        value={confirm}
        onChangeText={setConfirm}
      />

      {/* Save Button */}
      <TouchableOpacity style={[styles.bottomSave, { backgroundColor: colors.primary, borderColor: colors.border }]}>
        <Text style={[styles.bottomSaveText, { color: colors.text }]}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },

  rulesBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
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
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },

  bottomSaveText: {
    fontSize: 17,
    fontWeight: "700",
  },
});