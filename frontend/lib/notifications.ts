import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys for notification preferences
const WEEKLY_REVIEW_KEY = '@weekly_review_enabled';
const TASK_REMINDERS_KEY = '@task_reminders_enabled';
const STRESS_ALERTS_KEY = '@stress_alerts_enabled';

// Notification channel IDs
const WEEKLY_REVIEW_ID = 'weekly-review';
const TASK_REMINDER_ID = 'task-reminder';
const STRESS_ALERT_ID = 'stress-alert';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFB052',
    });
  }

  return true;
}

// ==================== WEEKLY REVIEW NOTIFICATIONS ====================

export async function scheduleWeeklyReviewNotifications() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    // Cancel any existing weekly review notifications first
    await cancelWeeklyReviewNotifications();

    // Schedule for every Sunday at 6:00 PM
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_REVIEW_ID,
      content: {
        title: 'Time for Your Weekly Review',
        body: 'Reflect on your week and see patterns in your thoughts.',
        data: { type: 'weekly_review' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday
        hour: 18,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(WEEKLY_REVIEW_KEY, 'true');
    console.log('Weekly review notifications scheduled');
  } catch (error) {
    console.error('Error scheduling weekly review:', error);
  }
}

export async function cancelWeeklyReviewNotifications() {
  try {
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_REVIEW_ID);
    await AsyncStorage.setItem(WEEKLY_REVIEW_KEY, 'false');
    console.log('Weekly review notifications cancelled');
  } catch (error) {
    console.error('Error cancelling weekly review:', error);
  }
}

export async function isWeeklyReviewEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(WEEKLY_REVIEW_KEY);
  return value === 'true';
}

// ==================== TASK REMINDER NOTIFICATIONS ====================

export async function scheduleTaskReminders() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    // Cancel existing task reminders
    await cancelTaskReminders();

    // Morning reminder - 9:00 AM daily
    await Notifications.scheduleNotificationAsync({
      identifier: `${TASK_REMINDER_ID}-morning`,
      content: {
        title: 'Good Morning',
        body: 'Check your tasks for today and get started.',
        data: { type: 'task_reminder', time: 'morning' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    // Evening reminder - 6:00 PM daily
    await Notifications.scheduleNotificationAsync({
      identifier: `${TASK_REMINDER_ID}-evening`,
      content: {
        title: 'Evening Check-in',
        body: 'Review your tasks and plan for tomorrow.',
        data: { type: 'task_reminder', time: 'evening' },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(TASK_REMINDERS_KEY, 'true');
    console.log('Task reminders scheduled');
  } catch (error) {
    console.error('Error scheduling task reminders:', error);
  }
}

export async function cancelTaskReminders() {
  try {
    await Notifications.cancelScheduledNotificationAsync(`${TASK_REMINDER_ID}-morning`);
    await Notifications.cancelScheduledNotificationAsync(`${TASK_REMINDER_ID}-evening`);
    await AsyncStorage.setItem(TASK_REMINDERS_KEY, 'false');
    console.log('Task reminders cancelled');
  } catch (error) {
    console.error('Error cancelling task reminders:', error);
  }
}

export async function areTaskRemindersEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(TASK_REMINDERS_KEY);
  return value === 'true';
}

// ==================== STRESS ALERT NOTIFICATIONS ====================

/**
 * Schedule a stress alert notification when user has high activity
 * This should be called when detecting stress patterns (e.g., many dumps in short time)
 */
export async function scheduleStressAlert(reason: string) {
  try {
    const enabled = await areStressAlertsEnabled();
    if (!enabled) return;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Take a Breath',
        body: reason || 'You\'ve been dumping a lot of thoughts. Consider taking a break.',
        data: { type: 'stress_alert' },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log('Stress alert sent');
  } catch (error) {
    console.error('Error sending stress alert:', error);
  }
}

/**
 * Check for stress patterns and send alert if needed
 * Call this after creating a note
 */
export async function checkForStressPatterns(recentDumpCount: number) {
  const enabled = await areStressAlertsEnabled();
  if (!enabled) return;

  // If user has dumped 5+ times in the last hour, send a stress alert
  if (recentDumpCount >= 5) {
    await scheduleStressAlert(
      `You've brain dumped ${recentDumpCount} times recently. Remember to take breaks and breathe.`
    );
  }
}

export async function enableStressAlerts() {
  await AsyncStorage.setItem(STRESS_ALERTS_KEY, 'true');
  console.log('Stress alerts enabled');
}

export async function disableStressAlerts() {
  await AsyncStorage.setItem(STRESS_ALERTS_KEY, 'false');
  console.log('Stress alerts disabled');
}

export async function areStressAlertsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STRESS_ALERTS_KEY);
  return value === 'true';
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get count of notes created in the last hour
 */
export async function getRecentDumpCount(notes: any[]): Promise<number> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  return notes.filter((note: any) => {
    const noteDate = new Date(note.created_at);
    return noteDate >= oneHourAgo;
  }).length;
}

/**
 * Initialize all notifications based on saved preferences
 */
export async function initializeNotifications() {
  try {
    const [weeklyEnabled, tasksEnabled] = await Promise.all([
      isWeeklyReviewEnabled(),
      areTaskRemindersEnabled(),
    ]);

    if (weeklyEnabled) {
      await scheduleWeeklyReviewNotifications();
    }

    if (tasksEnabled) {
      await scheduleTaskReminders();
    }

    console.log('Notifications initialized');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.multiRemove([
    WEEKLY_REVIEW_KEY,
    TASK_REMINDERS_KEY,
    STRESS_ALERTS_KEY,
  ]);
  console.log('All notifications cancelled');
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}