import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [initials, setInitials] = useState("");
  
  // Saved avatar URL (from database)
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  // Local preview URI (selected but not yet saved)
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // The displayed image is the pending one if it exists, otherwise the saved one
  const displayedImage = pendingImageUri || savedAvatarUrl;
  const hasUnsavedImage = pendingImageUri !== null;

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        Alert.alert("Error", "Not authenticated");
        router.back();
        return;
      }

      const user = session.user;
      setUserId(user.id);
      
      // Get name from user metadata
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

      // Split full name into first and last
      const nameParts = fullName.trim().split(/\s+/);
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");

      // Get other metadata
      setUsername(user.user_metadata?.username || user.email?.split("@")[0] || "");
      setBio(user.user_metadata?.bio || "");
      setSavedAvatarUrl(user.user_metadata?.avatar_url || null);

      // Calculate initials
      updateInitials(nameParts[0] || "", nameParts.slice(1).join(" ") || "");

    } catch (err: any) {
      console.error("Error loading profile:", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function updateInitials(first: string, last: string) {
    const firstInitial = first.trim()[0]?.toUpperCase() || "";
    const lastInitial = last.trim()[0]?.toUpperCase() || "";
    setInitials(firstInitial + lastInitial || "U");
  }

  // Update initials when name changes
  useEffect(() => {
    updateInitials(firstName, lastName);
  }, [firstName, lastName]);

  async function pickImage() {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to change your profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Just set the local preview, don't upload yet
        setPendingImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image");
    }
  }

  function clearPendingImage() {
    setPendingImageUri(null);
  }

  async function uploadAvatar(uri: string): Promise<string | null> {
    if (!userId) {
      console.error("No user ID for avatar upload");
      return null;
    }

    try {
      console.log("Starting avatar upload for user:", userId);
      console.log("Image URI:", uri);

      // Create file name with timestamp to avoid caching issues
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log("File path:", filePath);

      // Fetch the image as a blob - works on both web and native
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log("Blob size:", blob.size, "Type:", blob.type);

      // Convert blob to ArrayBuffer for more reliable upload
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      console.log("ArrayBuffer size:", arrayBuffer.byteLength);

      const uploadResult = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: blob.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        });

      if (uploadResult.error) {
        console.error("Upload error:", uploadResult.error);
        throw uploadResult.error;
      }

      console.log("Upload successful:", uploadResult.data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      console.log("Public URL:", urlData.publicUrl);

      return urlData.publicUrl;

    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      throw err;
    }
  }

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    setSaving(true);
    try {
      // Combine first and last name for full_name
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Prepare update data
      const updateData: Record<string, any> = {
        full_name: fullName,
        username: username.trim(),
        bio: bio.trim(),
      };

      // If there's a pending image, upload it now
      if (pendingImageUri) {
        console.log("Uploading pending image...");
        try {
          const newAvatarUrl = await uploadAvatar(pendingImageUri);
          if (newAvatarUrl) {
            updateData.avatar_url = newAvatarUrl;
            console.log("Avatar URL to save:", newAvatarUrl);
          } else {
            console.warn("Upload returned null URL");
          }
        } catch (uploadError: any) {
          console.error("Avatar upload failed:", uploadError);
          Alert.alert(
            "Upload Failed", 
            `Could not upload profile picture: ${uploadError.message || 'Unknown error'}. Your other profile changes will still be saved.`
          );
        }
      }

      console.log("Updating user metadata:", updateData);

      // Update user metadata
      const { data, error: metadataError } = await supabase.auth.updateUser({
        data: updateData,
      });

      if (metadataError) {
        console.error("Metadata update error:", metadataError);
        throw metadataError;
      }

      console.log("User updated successfully:", data);

      // Clear the pending image since it's now saved
      setPendingImageUri(null);
      
      // Update the saved URL if we uploaded a new image
      if (updateData.avatar_url) {
        setSavedAvatarUrl(updateData.avatar_url);
      }

      router.back();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      Alert.alert("Error", err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // If there are unsaved changes, ask for confirmation
    if (hasUnsavedImage) {
      Alert.alert(
        "Discard Changes?",
        "You have an unsaved profile picture. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.headerSave, { color: saving ? colors.textSecondary : colors.primary }]}>
            {saving ? "Saving..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} disabled={saving}>
          <View style={[styles.profileCircle, { backgroundColor: colors.primary, borderColor: colors.border }]}>
            {displayedImage ? (
              <Image source={{ uri: displayedImage }} style={styles.profileImage} />
            ) : (
              <Text style={[styles.profileInitial, { color: colors.text }]}>{initials}</Text>
            )}
          </View>
          {/* Camera icon overlay */}
          <View style={[styles.cameraIconContainer, { backgroundColor: colors.primaryDark }]}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickImage} disabled={saving}>
          <Text style={[styles.changePhoto, { color: colors.primary }]}>
            Change Photo
          </Text>
        </TouchableOpacity>

        {/* Show indicator if there's an unsaved image */}
        {hasUnsavedImage && (
          <View style={styles.unsavedIndicator}>
            <Text style={[styles.unsavedText, { color: colors.textSecondary }]}>
              New photo selected • Click SAVE to apply
            </Text>
            <TouchableOpacity onPress={clearPendingImage}>
              <Text style={[styles.undoText, { color: colors.error }]}>Undo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* First Name Field */}
      <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your first name"
        placeholderTextColor={colors.placeholder}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      {/* Last Name Field */}
      <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your last name"
        placeholderTextColor={colors.placeholder}
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />

      {/* Username Field */}
      <Text style={[styles.label, { color: colors.text }]}>Username</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your username"
        placeholderTextColor={colors.placeholder}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
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
        value={bio}
        onChangeText={setBio}
        maxLength={200}
      />
      <Text style={[styles.charCount, { color: colors.textSecondary }]}>
        {bio.length}/200
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 40,
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
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
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  profileInitial: {
    fontSize: 40,
    fontWeight: "700",
  },

  cameraIconContainer: {
    position: "absolute",
    bottom: 12,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  changePhoto: {
    fontSize: 16,
    fontWeight: "600",
  },

  unsavedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },

  unsavedText: {
    fontSize: 13,
    fontStyle: "italic",
  },

  undoText: {
    fontSize: 13,
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
    fontSize: 16,
  },

  bioInput: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 100,
    fontSize: 16,
  },

  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 20,
  },
});