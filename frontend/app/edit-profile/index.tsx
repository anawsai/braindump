import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() && !email.trim()) {
      Alert.alert("Error", "Please fill in at least one field");
      return;
    }

    setSaving(true);
    try {
      // Add your save logic here
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]} pointerEvents="none">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.headerSave, { color: colors.primary }]}>
            {saving ? "..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <View style={[styles.profileCircle, { backgroundColor: colors.primary, borderColor: colors.border }]}>
          <Text style={[styles.profileInitial, { color: colors.text }]}>A</Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.changePhoto, { color: colors.primary }]}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Name Field */}
      <Text style={[styles.label, { color: colors.text }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your name"
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={setName}
      />

      {/* Email Field */}
      <Text style={[styles.label, { color: colors.text }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your email"
        placeholderTextColor={colors.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Bio Field */}
      <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
      <TextInput
        style={[styles.bioInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Tell us about yourself..."
        placeholderTextColor={colors.placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.bottomSave, { backgroundColor: colors.primary, borderColor: colors.border }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={[styles.bottomSaveText, { color: colors.text }]}>
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </Text>
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
    justifyContent: "space-between",
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

  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
  },

  profileInitial: {
    fontSize: 40,
    fontWeight: "700",
  },

  changePhoto: {
    fontSize: 16,
    fontWeight: "600",
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

  bioInput: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 30,
    minHeight: 100,
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