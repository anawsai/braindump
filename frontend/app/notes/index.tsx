// notes page here
//Add details and stuff in other files in this folder

// import { View, Text } from 'react-native';

// export default function Notes() {
//   return (
//     <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fafafa' }}>
//       <Text style={{ fontSize:32, fontWeight:'700' }}>Notes</Text>
//       <Text style={{ color:'#666', marginTop:8 }}>Notes page coming soon</Text>
//     </View>
//   );
// }

// Notes page - view all saved notes
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Notes() {
  const [noteText, setNoteText] = useState("");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with menu and avatar */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
      </View>

      {/* Brain prompt */}
      <View style={styles.promptContainer}>
        <Text style={styles.brainEmoji}>🧠</Text>
        <Text style={styles.promptText}>What makes you feel overwhelmed?</Text>
      </View>

      {/* Text input area */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="What's on your mind? Ideas, tasks, random thoughts, anything...."
          placeholderTextColor="#999"
          multiline
          value={noteText}
          onChangeText={setNoteText}
          style={styles.textInput}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save & Organize</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFB052",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  promptContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  brainEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#F5F5F5",
    marginBottom: 24,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
});