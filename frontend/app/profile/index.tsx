import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// IMPORT YOUR CUSTOM IMAGES
const profileBrain = require("../../assets/profile-brain.png");
const profilePeople = require("../../assets/profile-people.png");

export default function Profile() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeaderGroup}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={30} color="black" />
      </View>

      {/* Profile Circle */}
      <View style={styles.centerSection}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitials}>PW</Text>
        </View>
        <Text style={styles.profileName}>Jeffrey Jones</Text>
        <Text style={styles.profileUsername}>jjisthebest243</Text>
      </View>

      {/* Journey Section */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Your Brain Dump Journey</Text>

        <View style={styles.statsRow}>

          {/* LEFT BOX — Brain */}
          <View style={styles.statCard}>
            <Image source={profileBrain} style={styles.statIcon} />
            <Text style={styles.statNumber}>47</Text>
          </View>

          {/* MIDDLE BOX — empty box */}
          <View style={styles.statCard} />

          {/* RIGHT BOX — People */}
          <View style={styles.statCard}>
            <Image source={profilePeople} style={styles.statIcon} />
            <Text style={styles.statNumber}>5</Text>
          </View>

        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={70} color="#f28c40" />
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
              size={24}
              color={i < 3 ? "#f28c40" : "#e5d7c4"}
            />
          </View>
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.sectionBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsRow}>
          <View style={styles.achievementCard}>
            <Ionicons name="download" size={32} color="#fff" />
            <Text style={styles.achievementText}>First Dump</Text>
          </View>

          <View style={styles.achievementCard}>
            <Ionicons name="flame" size={32} color="#fff" />
            <Text style={styles.achievementText}>Week Straight</Text>
          </View>

          <View style={styles.achievementCard}>
            <Ionicons name="people" size={32} color="#fff" />
            <Text style={styles.achievementText}>Team Player</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ------------------  STYLES  ------------------ */

const theme = {
  bg: "#fff",
  outerBox: "#FFE6C8",
  innerBox: "#A35900",
  accent: "#f28c40",
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
  sectionBox: {
    backgroundColor: theme.outerBox,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: theme.innerBox,
    width: "30%",
    height: 90,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  statNumber: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  /* Streak */
  streakSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: "700",
    marginTop: 10,
  },
  streakText: {
    color: "#444",
    marginTop: -6,
  },

  /* Week */
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.outerBox,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
  },
  dayItem: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  /* Achievements */
  achievementsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  achievementCard: {
    backgroundColor: theme.innerBox,
    width: "30%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  achievementText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    color: "#555",
    fontWeight: "500",
  },
});
