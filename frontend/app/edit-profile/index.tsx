import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const router = useRouter();

  const [name, setName] = useState("Jeffrey Jones");
  const [username, setUsername] = useState("jjisthebest243");
  const [email, setEmail] = useState("jeffreyjones@gmail.com");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={38} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity onPress={() => console.log("Save pressed")}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE PICTURE */}
      <View style={styles.profileCenter}>
        <View style={styles.profileCircle}>
          <Text style={styles.initials}>PW</Text>
        </View>

        <TouchableOpacity>
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
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* CHANGE PASSWORD BUTTON */}
      <TouchableOpacity
        style={styles.grayButton}
        onPress={() => router.push("/change-password")}
      >
        <Ionicons name="lock-closed" size={24} color="black" style={{ marginRight: 10 }} />
        <Text style={styles.grayButtonText}>Change Password</Text>
      </TouchableOpacity>


      {/* DELETE ACCOUNT BUTTON */}
      <TouchableOpacity style={styles.deleteButton}>
        <Ionicons name="alert-circle" size={28} color="black" style={{ marginRight: 10 }} />
        <Text style={styles.deleteText}>Permanently Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ========================= STYLES ========================= */

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
  },
  saveText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
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
    backgroundColor: "#F4B166",
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
    backgroundColor: "#F4B166",
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
