import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import React from "react";
import { fetchNotes, getUserStats, getUserActivity, getUserAchievements } from "../../lib/api";

type UserStats = {
  current_streak: number;
  longest_streak: number;
  total_dumps: number;
  tasks_completed: number;
};

type DailyActivity = {
  date: string;
  dump_count: number;
};

type Achievement = {
  type: string;
  name: string;
  icon: string;
  unlocked: boolean;
};

export default function Profile() {
  const router = useRouter();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileInitials, setProfileInitials] = useState("");
  const [noteCount, setNoteCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Dynamic data state
  const [userStats, setUserStats] = useState<UserStats>({
    current_streak: 0,
    longest_streak: 0,
    total_dumps: 0,
    tasks_completed: 0,
  });
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Helper: extract name/email/initials from Supabase user
  function applySessionUser(session: any | null) {
    if (!session || !session.user) {
      setProfileName("");
      setProfileEmail("");
      setProfileInitials("");
      setUserId(null);
      return;
    }

    const user = session.user;
    setUserId(user.id);

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

  // Fetch user stats, activity, and achievements
  async function loadUserData(uid: string) {
    try {
      const [stats, activity, achievementsData] = await Promise.all([
        getUserStats(uid),
        getUserActivity(uid),
        getUserAchievements(uid),
      ]);

      setUserStats(stats);
      setWeeklyActivity(activity);
      setAchievements(achievementsData);
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  }

  useEffect(() => {
    // Fetch current session user
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySessionUser(session);
      if (session?.user?.id) {
        loadUserData(session.user.id);
      }
    });

    fetchNotes()
      .then((notes) => setNoteCount(notes.length))
      .catch((err) => console.error("Failed to fetch notes:", err));

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionUser(session);
      if (session?.user?.id) {
        loadUserData(session.user.id);
      }
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
          {/* LEFT BOX — Total Dumps */}
          <View style={styles.statCard}>
            <Ionicons name="trash" size={50} color="#000" />
            <Text style={styles.statNumber}>{userStats.total_dumps || noteCount}</Text>
          </View>

          {/* RIGHT BOX — Tasks Completed */}
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={50} color="#000" />
            <Text style={styles.statNumber}>{userStats.tasks_completed}</Text>
          </View>
        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={75} color="#FF8D05" />
        <Text style={styles.streakNumber}>{userStats.current_streak}</Text>
        <Text style={styles.streakText}>day streak</Text>
      </View>

      {/* Week Row - Dynamic from weeklyActivity */}
      <View style={styles.weekContainer}>
        {weeklyActivity.length > 0 ? (
          weeklyActivity.map((day, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={styles.dayLabel}>{day.date.toUpperCase()}</Text>
              <Ionicons
                name="flame"
                size={40}
                color={day.dump_count > 0 ? "#FF8D05" : "#e5d7c4"}
              />
            </View>
          ))
        ) : (
          // Fallback if no activity data yet
          ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={styles.dayLabel}>{day}</Text>
              <Ionicons name="flame" size={40} color="#e5d7c4" />
            </View>
          ))
        )}
      </View>

      {/* Achievements - Dynamic */}
      <View style={styles.achievementsBox}>
        <View style={styles.achievementHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsRow}>
          {achievements.length > 0 ? (
            achievements.map((achievement, i) => (
              <View
                key={i}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <Ionicons
                  name={achievement.icon as any}
                  size={35}
                  color={achievement.unlocked ? "#000" : "#999"}
                />
                <Text
                  style={[
                    styles.achievementText,
                    !achievement.unlocked && styles.achievementTextLocked,
                  ]}
                >
                  {achievement.name}
                </Text>
              </View>
            ))
          ) : (
            // Fallback achievements
            <>
              <View style={[styles.achievementCard, styles.achievementLocked]}>
                <Ionicons name="download" size={35} color="#999" />
                <Text style={[styles.achievementText, styles.achievementTextLocked]}>First Dump</Text>
              </View>
              <View style={[styles.achievementCard, styles.achievementLocked]}>
                <Ionicons name="flame" size={35} color="#999" />
                <Text style={[styles.achievementText, styles.achievementTextLocked]}>Week Straight</Text>
              </View>
              <View style={[styles.achievementCard, styles.achievementLocked]}>
                <Ionicons name="checkmark" size={35} color="#999" />
                <Text style={[styles.achievementText, styles.achievementTextLocked]}>Task Complete</Text>
              </View>
            </>
          )}
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
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
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
    width: "60%",
    alignSelf: "center",
    gap: 20,
    flexWrap: "wrap",
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
    alignSelf: "center",
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
    flexWrap: "wrap",
  },
  achievementCard: {
    backgroundColor: theme.innerBox,
    width: 160,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  achievementLocked: {
    backgroundColor: "#d9d9d9",
    opacity: 0.7,
  },
  achievementText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  achievementTextLocked: {
    color: "#666",
  },
  viewAll: {
    color: "#555",
    fontWeight: "500",
    fontSize: 14,
    textAlign: "right",
  },
});