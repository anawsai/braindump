import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RelatedNotes() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create</Text>
        </View>

        <Text style={styles.headerCenter}>Related</Text>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* FOUND RELATED THOUGHTS */}
        <Text style={styles.foundText}>Found 3 related thoughts!</Text>

        <Image
          source={require("../../assets/mascot.png")} // ← replace with your actual asset
          style={styles.mascot}
        />

        {/* NOTE CARDS (STATIC EXAMPLE FOR NOW) */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <View key={idx} style={styles.noteCard}>
            <Text style={styles.noteTitle}>Note Title</Text>
            <Text style={styles.noteBody}>Full raw note in detail....</Text>

            <View style={styles.themeBox}>
              <Text style={styles.themeText}>Common themes: blah, blah</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },

  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  headerCenter: {
    fontSize: 18,
    fontWeight: "700",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: "center",
  },

  foundText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },

  mascot: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },

  noteCard: {
    width: "100%",
    backgroundColor: "#FFB052",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 22,
  },

  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  noteBody: {
    fontSize: 14,
    marginBottom: 12,
  },

  themeBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    alignSelf: "flex-start",
  },

  themeText: {
    fontSize: 12,
    color: "#333",
  },
});
