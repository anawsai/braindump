import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import {
  isWeeklyReviewEnabled,
  areTaskRemindersEnabled,
  areStressAlertsEnabled,
  scheduleWeeklyReviewNotifications,
  cancelWeeklyReviewNotifications,
  scheduleTaskReminders,
  cancelTaskReminders,
  enableStressAlerts,
  disableStressAlerts,
  requestNotificationPermissions,
} from "../../lib/notifications";
import {
  isBiometricAvailable,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
  getBiometricType,
  authenticateWithBiometric,
} from "../../lib/biometric";

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, colors, toggleTheme } = useTheme();

  // === UI toggles ===
  const [biometricLock, setBiometricLock] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [weeklyReview, setWeeklyReview] = useState(false);
  const [taskReminders, setTaskReminders] = useState(false);
  const [stressAlerts, setStressAlerts] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Load all settings on mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  async function loadAllSettings() {
    try {
      setLoading(true);

      // Load user session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session in settings:", error.message);
      } else {
        applySessionUser(data.session ?? null);
      }

      // Load notification preferences and biometric settings
      const [weeklyEnabled, tasksEnabled, stressEnabled, biometricEnabled, bioType] = await Promise.all([
        isWeeklyReviewEnabled(),
        areTaskRemindersEnabled(),
        areStressAlertsEnabled(),
        isBiometricLockEnabled(),
        getBiometricType(),
      ]);

      setWeeklyReview(weeklyEnabled);
      setTaskReminders(tasksEnabled);
      setStressAlerts(stressEnabled);
      setBiometricLock(biometricEnabled);
      setBiometricType(bioType);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }

  // === Biometric Lock Handler ===

  async function handleBiometricLockToggle(value: boolean) {
    try {
      if (value) {
        // Check if biometric is available
        const available = await isBiometricAvailable();
        if (!available) {
          Alert.alert(
            'Not Available',
            `${biometricType} is not set up on this device. Please enable it in your device settings first.`
          );
          return;
        }

        // Test authentication before enabling
        const authenticated = await authenticateWithBiometric();
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Please try again.');
          return;
        }

        await setBiometricLockEnabled(true);
        setBiometricLock(true);
        Alert.alert('Success', `${biometricType} lock enabled. The app will require authentication when opened.`);
      } else {
        // Require authentication to disable
        const authenticated = await authenticateWithBiometric();
        if (!authenticated) {
          Alert.alert('Authentication Required', 'You must authenticate to disable biometric lock.');
          return;
        }

        await setBiometricLockEnabled(false);
        setBiometricLock(false);
      }
    } catch (error) {
      console.error('Error toggling biometric lock:', error);
      Alert.alert('Error', 'Failed to update biometric lock setting');
    }
  }

  // === Notification Handlers ===

  async function handleWeeklyReviewToggle(value: boolean) {
    try {
      if (value) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive weekly review reminders.'
          );
          return;
        }
        await scheduleWeeklyReviewNotifications();
        Alert.alert('Success', 'Weekly review reminders enabled. You will receive a notification every Sunday at 6 PM.');
      } else {
        await cancelWeeklyReviewNotifications();
      }
      setWeeklyReview(value);
    } catch (error) {
      console.error('Error toggling weekly review:', error);
      Alert.alert('Error', 'Failed to update weekly review settings');
    }
  }

  async function handleTaskRemindersToggle(value: boolean) {
    try {
      if (value) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive task reminders.'
          );
          return;
        }
        await scheduleTaskReminders();
        Alert.alert(
          'Success',
          'Task reminders enabled. You will receive notifications at 9 AM and 6 PM daily to check your tasks.'
        );
      } else {
        await cancelTaskReminders();
      }
      setTaskReminders(value);
    } catch (error) {
      console.error('Error toggling task reminders:', error);
      Alert.alert('Error', 'Failed to update task reminder settings');
    }
  }

  async function handleStressAlertsToggle(value: boolean) {
    try {
      if (value) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive stress alerts.'
          );
          return;
        }
        await enableStressAlerts();
        Alert.alert(
          'Stress Alerts Enabled',
          'We will send you a gentle reminder to take a break if we detect stress patterns in your brain dumps.'
        );
      } else {
        await disableStressAlerts();
      }
      setStressAlerts(value);
    } catch (error) {
      console.error('Error toggling stress alerts:', error);
      Alert.alert('Error', 'Failed to update stress alert settings');
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
      return;
    }
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading settings...
          </Text>
        </View>
      </View>
    );
  }

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
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy / Appearance</Text>

      <SettingRow
        icon={<Ionicons name="finger-print" size={24} color={colors.icon} />}
        label={`${biometricType} Lock`}
        subtitle="Require authentication to open app"
        value={biometricLock}
        onValueChange={handleBiometricLockToggle}
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
        subtitle="Every Sunday at 6 PM"
        value={weeklyReview}
        onValueChange={handleWeeklyReviewToggle}
      />

      <SettingRow
        icon={<Ionicons name="notifications-outline" size={24} color={colors.icon} />}
        label="Task Reminders"
        subtitle="Daily at 9 AM and 6 PM"
        value={taskReminders}
        onValueChange={handleTaskRemindersToggle}
      />

      <SettingRow
        icon={<Ionicons name="sparkles-outline" size={24} color={colors.icon} />}
        label="Stress Alerts"
        subtitle="Get notified to take breaks"
        value={stressAlerts}
        onValueChange={handleStressAlertsToggle}
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
  subtitle,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
      <View style={styles.settingLeft}>
        {icon}
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
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
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
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