import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import React from "react";
import { fetchNotes, getUserStats, getUserActivity } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";
import { useLoading } from "../../context/LoadingContext";

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

// Compute achievements based on actual user stats
function computeAchievements(stats: UserStats, noteCount: number): Achievement[] {
  const totalDumps = stats.total_dumps || noteCount;
  
  return [
    {
      type: "first_dump",
      name: "First Dump",
      icon: "download",
      unlocked: totalDumps >= 1,
    },
    {
      type: "week_streak",
      name: "Week Straight",
      icon: "flame",
      unlocked: stats.current_streak >= 7 || stats.longest_streak >= 7,
    },
    {
      type: "task_complete",
      name: "Task Complete",
      icon: "checkmark",
      unlocked: stats.tasks_completed >= 1,
    },
  ];
}

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { start, stop } = useLoading();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileInitials, setProfileInitials] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [noteCount, setNoteCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [userStats, setUserStats] = useState<UserStats>({
    current_streak: 0,
    longest_streak: 0,
    total_dumps: 0,
    tasks_completed: 0,
  });
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  function applySessionUser(user: any | null) {
    if (!user) {
      setProfileName("");
      setProfileEmail("");
      setProfileInitials("");
      setAvatarUrl(null);
      setUserId(null);
      return;
    }

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
    // Add cache buster to avatar URL to force refresh
    const avatar = user.user_metadata?.avatar_url;
    if (avatar) {
      setAvatarUrl(`${avatar}?t=${Date.now()}`);
    } else {
      setAvatarUrl(null);
    }
  }

  async function loadUserData(uid: string, currentNoteCount: number) {
    try {
      const [stats, activity] = await Promise.all([
        getUserStats(uid),
        getUserActivity(uid),
      ]);

      setUserStats(stats);
      setWeeklyActivity(activity);
      
      // Always compute achievements locally from actual stats
      setAchievements(computeAchievements(stats, currentNoteCount));
    } catch (err) {
      console.error("Failed to load user data:", err);
      setAchievements(computeAchievements(userStats, currentNoteCount));
    }
  }

  // Reload user data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        // Only show loading animation on first load
        if (!hasLoadedOnce) {
          start('Loading profile...');
        }
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          applySessionUser(user);
          
          const notes = await fetchNotes();
          const currentNoteCount = notes.length;
          setNoteCount(currentNoteCount);
          
          if (user?.id) {
            await loadUserData(user.id, currentNoteCount);
          }
          
          setHasLoadedOnce(true);
        } catch (err) {
          console.error("Failed to load profile:", err);
        } finally {
          if (!hasLoadedOnce) {
            stop();
          }
        }
      }
      
      loadProfile();
    }, [hasLoadedOnce])
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeaderGroup}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={35} color={colors.icon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/edit-profile')}>
          <Ionicons name="pencil" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Profile Circle */}
      <View style={styles.centerSection}>
        <View style={[styles.profileCircle, { backgroundColor: colors.primaryDark }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileInitials}>{profileInitials}</Text>
          )}
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{profileName}</Text>
        <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>{profileEmail}</Text>
      </View>

      {/* Journey Section */}
      <View style={[styles.journeyBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Brain Dump Journey</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryDark }]}>
            <Ionicons name="trash" size={50} color={colors.icon} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{userStats.total_dumps || noteCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Brain Dumps</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.primaryDark }]}>
            <Ionicons name="checkmark-circle" size={50} color={colors.icon} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{userStats.tasks_completed}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Tasks Done</Text>
          </View>
        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={75} color={colors.primaryDark} />
        <Text style={[styles.streakNumber, { color: colors.text }]}>{userStats.current_streak}</Text>
        <Text style={[styles.streakText, { color: colors.textSecondary }]}>day streak</Text>
      </View>

      {/* Week Row */}
      <View style={[styles.weekContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        {weeklyActivity.length > 0 ? (
          weeklyActivity.map((day, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={[styles.dayLabel, { color: colors.text }]}>{day.date.toUpperCase()}</Text>
              <Ionicons
                name="flame"
                size={40}
                color={day.dump_count > 0 ? colors.primaryDark : colors.border}
              />
            </View>
          ))
        ) : (
          ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={[styles.dayLabel, { color: colors.text }]}>{day}</Text>
              <Ionicons name="flame" size={40} color={colors.border} />
            </View>
          ))
        )}
      </View>

      {/* Achievements */}
      <View style={[styles.achievementsBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <View style={styles.achievementHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.textSecondary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsRow}>
          {achievements.length > 0 ? (
            achievements.map((achievement, i) => (
              <View
                key={i}
                style={[
                  styles.achievementCard,
                  { backgroundColor: achievement.unlocked ? colors.primaryDark : colors.surface },
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                {achievement.unlocked && (
                  <View style={[styles.unlockedBadge, { backgroundColor: colors.success || '#22c55e' }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
                <Ionicons
                  name={achievement.icon as any}
                  size={35}
                  color={achievement.unlocked ? colors.icon : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.achievementText,
                    { color: achievement.unlocked ? colors.text : colors.textSecondary },
                  ]}
                >
                  {achievement.name}
                </Text>
              </View>
            ))
          ) : (
            // Fallback: compute achievements directly if state is empty
            computeAchievements(userStats, noteCount).map((achievement, i) => (
              <View
                key={i}
                style={[
                  styles.achievementCard,
                  { backgroundColor: achievement.unlocked ? colors.primaryDark : colors.surface },
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                {achievement.unlocked && (
                  <View style={[styles.unlockedBadge, { backgroundColor: colors.success || '#22c55e' }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
                <Ionicons
                  name={achievement.icon as any}
                  size={35}
                  color={achievement.unlocked ? colors.icon : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.achievementText,
                    { color: achievement.unlocked ? colors.text : colors.textSecondary },
                  ]}
                >
                  {achievement.name}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

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

  centerSection: {
    alignItems: "center",
    marginBottom: 35,
  },
  profileCircle: {
    width: 160,
    height: 160,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    marginTop: 4,
    fontSize: 14,
  },

  journeyBox: {
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 25,
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
    width: "100%",
    marginTop: 10,
    flexWrap: "wrap",
  },
  statCard: {
    width: 150,
    height: 140,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
    marginTop: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.9,
  },

  streakSection: {
    alignItems: "center",
    marginBottom: 13,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: "700",
  },
  streakText: {},

  weekContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 25,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  dayItem: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  achievementsBox: {
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 25,
    maxWidth: 650,
    width: "100%",
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
    gap: 15,
    alignItems: "center",
    flexWrap: "wrap",
  },
  achievementCard: {
    width: 140,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    position: "relative",
  },
  achievementLocked: {
    opacity: 0.7,
  },
  achievementText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  viewAll: {
    fontWeight: "500",
    fontSize: 14,
    textAlign: "right",
  },
  unlockedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});