import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function EditProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.log("Error loading user:", error);
        setLoading(false);
        return;
      }

      const user = data.user;

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.username ||
        (user.email ? user.email.split("@")[0] : "User");

      const userEmail = user.email ?? "";

      const derivedInitials =
        fullName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase())
          .join("") || "U";

      setName(fullName);
      setUsername(user.user_metadata?.username || "");
      setEmail(userEmail);
      setInitials(derivedInitials);

      setLoading(false);
    }

    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          username: username,
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert("Profile updated", "Your changes have been saved.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 200 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={38} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* PROFILE PICTURE */}
      <View style={styles.profileCenter}>
        <View style={styles.profileCircle}>
          <Text style={styles.initials}>{initials}</Text>
        </View>

        <TouchableOpacity onPress={() => console.log("Change photo pressed")}>
          <Text style={styles.changePhoto}>Tap to change photo</Text>
        </TouchableOpacity>
      </View>

      {/* FORM FIELDS */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Enter a username"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { opacity: 0.8 }]}
          value={email}
          editable={false} // email from auth, not editable here
        />
      </View>

      {/* CHANGE PASSWORD BUTTON */}
      <TouchableOpacity
        style={styles.grayButton}
        onPress={() => router.push("/change-password")}
      >
        <Ionicons
          name="lock-closed"
          size={24}
          color="black"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.grayButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* DELETE ACCOUNT BUTTON */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          router.push("/delete-account")}
      >
        <Ionicons
          name="alert-circle"
          size={28}
          color="black"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.deleteText}>Permanently Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  /* PROFILE SECTION */
  profileCenter: {
    alignItems: "center",
    marginBottom: 32,
  },

  profileCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FF8D05",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  initials: {
    fontSize: 36,
    color: "white",
    fontWeight: "700",
  },
  changePhoto: {
    color: "#000",
    textDecorationLine: "underline",
    marginTop: 4,
    fontSize: 16,
  },

  /* INPUTS */
  fieldGroup: {
    marginBottom: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F1F1F1",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 16,
  },

  /* BUTTONS */
  grayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },
  grayButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8D05",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 20,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

