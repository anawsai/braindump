// app/settings.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, colors, toggleTheme } = useTheme();

  // === UI toggles ===
  const [keepPrivate, setKeepPrivate] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [stressAlerts, setStressAlerts] = useState(true);

  // === Profile state (same idea as sidebar) ===
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileInitials, setProfileInitials] = useState("");

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

  // Load current user when settings screen mounts
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting session in settings:", error.message);
        return;
      }
      applySessionUser(data.session ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
      return;
    }
    router.replace("/login");
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => router.push("/edit-profile")}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.avatarText}>
            {profileInitials || "JJ"}
          </Text>
        </View>
        <View>
          <Text style={[styles.accountName, { color: colors.text }]}>
            {profileName || "Jeffrey Jones"}
          </Text>
          <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
            {profileEmail || "jeffreyjones@gmail.com"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Privacy / Appearance */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy/ Appearance</Text>

      <SettingRow
        icon={<Ionicons name="shield-checkmark-outline" size={24} color={colors.icon} />}
        label="Keep personal data private"
        value={keepPrivate}
        onValueChange={setKeepPrivate}
      />

      <SettingRow
        icon={<Ionicons name={mode === 'dark' ? "moon" : "sunny-outline"} size={24} color={colors.icon} />}
        label={mode === 'dark' ? "Dark Mode" : "Light Mode"}
        value={mode === 'dark'}
        onValueChange={toggleTheme}
      />

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification</Text>

      <SettingRow
        icon={<Ionicons name="calendar-outline" size={24} color={colors.icon} />}
        label="Weekly Review"
        value={weeklyReview}
        onValueChange={setWeeklyReview}
      />

      <SettingRow
        icon={<Ionicons name="notifications-outline" size={24} color={colors.icon} />}
        label="Task Reminders"
        value={taskReminders}
        onValueChange={setTaskReminders}
      />

      <SettingRow
        icon={<Ionicons name="sparkles-outline" size={24} color={colors.icon} />}
        label="Stress Alerts"
        value={stressAlerts}
        onValueChange={setStressAlerts}
      />

      {/* Sign Out */}
      <TouchableOpacity 
        style={[styles.signOutButton, { backgroundColor: colors.primaryDark }]} 
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.icon} style={styles.signOutIcon} />
        <Text style={[styles.signOutText, { color: colors.text }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
      <View style={styles.settingLeft}>
        {icon}
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryDark }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
  },
  accountEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    borderRadius: 14,
    paddingVertical: 14,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});