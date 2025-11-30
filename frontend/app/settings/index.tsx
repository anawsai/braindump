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

export default function SettingsScreen() {
  const router = useRouter();

  // === UI toggles ===
  const [keepPrivate, setKeepPrivate] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profileInitials || "JJ"}
          </Text>
        </View>
        <View>
          <Text style={styles.accountName}>
            {profileName || "Jeffrey Jones"}
          </Text>
          <Text style={styles.accountEmail}>
            {profileEmail || "jeffreyjones@gmail.com"}
          </Text>
        </View>
      </View>

      {/* Privacy / Appearance */}
      <Text style={styles.sectionTitle}>Privacy/ Appearance</Text>

      <SettingRow
        icon={<Ionicons name="shield-checkmark-outline" size={24} />}
        label="Keep personal data private"
        value={keepPrivate}
        onValueChange={setKeepPrivate}
      />

      <SettingRow
        icon={<Ionicons name="sunny-outline" size={24} />}
        label="Light/Dark Mode"
        value={darkMode}
        onValueChange={setDarkMode}
      />

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notification</Text>

      <SettingRow
        icon={<Ionicons name="calendar-outline" size={24} />}
        label="Weekly Review"
        value={weeklyReview}
        onValueChange={setWeeklyReview}
      />

      <SettingRow
        icon={<Ionicons name="notifications-outline" size={24} />}
        label="Task Reminders"
        value={taskReminders}
        onValueChange={setTaskReminders}
      />

      <SettingRow
        icon={<Ionicons name="sparkles-outline" size={24} />}
        label="Stress Alerts"
        value={stressAlerts}
        onValueChange={setStressAlerts}
      />

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} style={styles.signOutIcon} />
        <Text style={styles.signOutText}>Sign Out</Text>
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
  return (
    <View style={styles.settingCard}>
      <View style={styles.settingLeft}>
        {icon}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d4d4d4", true: "#111827" }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    marginTop: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f4f1",
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FF8D05",
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
    color: "#111827",
  },
  accountEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f4f1",
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
    color: "#111827",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#FF8D05",
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});

