import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {useEffect, useState} from "react";
import { supabase } from "../../lib/supabase";
import React from "react";
import { fetchNotes } from "../../lib/api";

const profileBrain = require("../../assets/profile-brain.png");
const profilePeople = require("../../assets/profile-people.png");

export default function Profile(){
  const router = useRouter();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileInitials, setProfileInitials] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteCount, setNoteCount] = useState(0);

  // Helper: extract name/email/initials from Supabase user
  function applySessionUser(session: any | null) {
    if (!session || !session.user) {
      setProfileName("");
      setProfileEmail("");
      setProfileInitials("");
      return;
    }

    const user = session.user;

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.username ||
      (user.email ? user.email.split("@")[0] : "User");

    const email = user.email ?? "";

    const initials =
      fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join("") || "U";

    setProfileName(fullName);
    setProfileEmail(email);
    setProfileInitials(initials);
  }

  useEffect(() => {
    // fetch current session user
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySessionUser(session);
    });

    fetchNotes()
      .then((notes) => setNoteCount(notes.length))
      .catch((err) => console.error("Failed to fetch notes:", err))

    // listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionUser(session);
    });

    return () => {
      sub?.subscription.unsubscribe();
    };
  }, []);


  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeaderGroup}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={35} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Circle */}
      <View style={styles.centerSection}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitials}>{profileInitials}</Text>
        </View>
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.profileUsername}>{profileEmail}</Text>
      </View>

      {/* Journey Section */}
      <View style={styles.journeyBox}>
        <Text style={styles.sectionTitle}>Your Brain Dump Journey</Text>

        <View style={styles.statsRow}>

          {/* LEFT BOX — Brain */}
          <View style={styles.statCard}>
            <Ionicons name="trash" size={50} color="#000" />
            <Text style={styles.statNumber}>{noteCount}</Text>
          </View>

          {/* RIGHT BOX — People */}
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={50} color="#000"/>
            <Text style={styles.statNumber}>5</Text>
          </View>

        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={75} color="#FF8D05" />
        <Text style={styles.streakNumber}>3</Text>
        <Text style={styles.streakText}>day streak</Text>
      </View>

      {/* Week Row */}
      <View style={styles.weekContainer}>
        {["SUN", "MON", "TUE", "THU", "FRI", "SAT"].map((day, i) => (
          <View key={i} style={styles.dayItem}>
            <Text style={styles.dayLabel}>{day}</Text>
            <Ionicons
              name="flame"
              size={40}
              color={i < 3 ? "#FF8D05" : "#e5d7c4"}
            />
          </View>
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.achievementsBox}>
        <View style={styles.achievementHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsRow}>
          <View style={styles.achievementCard}>
            <Ionicons name="download" size={35} color="#000" />
            <Text style={styles.achievementText}>First Dump</Text>
          </View>

          <View style={styles.achievementCard}>
            <Ionicons name="flame" size={35} color="#000" />
            <Text style={styles.achievementText}>Week Straight</Text>
          </View>

          <View style={styles.achievementCard}>
            <Ionicons name="checkmark" size={35} color="#000" />
            <Text style={styles.achievementText}>Task Complete</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* STYLES */

const theme = {
  bg: "#fff",
  outerBox: "#FFE6C8",
  innerBox: "#FF8D05",
  accent: "#FF8D05",
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  leftHeaderGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  /* Profile */
  centerSection: {
    alignItems: "center",
    marginBottom: 35,
  },
  profileCircle: {
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: theme.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "600",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 15,
  },
  profileUsername: {
    color: "#777",
    marginTop: 4,
    fontSize: 14,
  },

  /* Sections */
  journeyBox: {
    backgroundColor: theme.outerBox,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
    width: 500,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: 'center',
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
    width: "100%",
    marginTop: 10,
  },
  statCard: {
    backgroundColor: theme.innerBox,
    width: 200,
    height: 120,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
  },
  statIcon: {
    marginTop: 10,
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },

  /* Streak */
  streakSection: {
    alignItems: "center",
    marginBottom: 13,
    width: "60%",
    alignSelf: "center",
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: "700",
  },
  streakText: {
    color: "#444",
  },

  /* Week */
  weekContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: theme.outerBox,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
    width: "43%",
    alignSelf: "center",
    gap: 35,
  },
  dayItem: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  /* Achievements */
    achievementsBox: {
    backgroundColor: theme.outerBox,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
    width: 650,
    alignSelf: 'center',
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  achievementsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 20,
    alignItems: "center",
  },
  achievementCard: {
    backgroundColor: theme.innerBox,
    width: 160,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  achievementText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  viewAll: {
    color: "#555",
    fontWeight: "500",
    fontSize: 14,
    textAlign: "right",
  },
});
