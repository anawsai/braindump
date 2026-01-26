import { Slot, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { View, Text, Pressable, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { fetchNotes, getUserStats } from '../lib/api';
import { Ionicons } from "@expo/vector-icons";
import { initializeNotifications } from '../lib/notifications';
import { isBiometricLockEnabled, authenticateWithBiometric } from '../lib/biometric';

function Sidebar({
  collapsed,
  onNavigate,
  onSignOut,
  noteCount,
  tasksCompleted,
  profileName,
  profileEmail,
  profileInitials,
}: {
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onSignOut: () => Promise<void>;
  noteCount: number;
  tasksCompleted: number;
  profileName: string;
  profileEmail: string;
  profileInitials: string;
}) {
  const { colors } = useTheme();
  
  if (collapsed) return null;

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.border }]}>
      <View style={styles.mascotSection}>
        <Image
          source={require('../assets/mascot.png')}
          style={styles.mascotImage}
        />
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <Pressable
        style={styles.profileSection}
        onPress={() => onNavigate('profile')}
      >
        <View style={styles.profileRow}>
          <View style={[styles.profileCircle, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.profileInitials}>{profileInitials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profileName}</Text>
            <Text style={[styles.profileEmail, { color: colors.text }]}>{profileEmail}</Text>
          </View>
        </View>

        <View style={styles.statsWrapper}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={23} color={colors.icon} />
            <Text style={[styles.statText, { color: colors.text }]}>{noteCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={23} color={colors.icon} />
            <Text style={[styles.statText, { color: colors.text }]}>{tasksCompleted}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.navSection}>
        <Pressable style={styles.navButton} onPress={() => onNavigate('/dump')}>
          <Text style={[styles.navButtonText, { color: colors.text }]}>Dump</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => onNavigate('/notes')}
        >
          <Ionicons name="journal" size={25} color={colors.icon} style={styles.navButtonIcon} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Notes</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={() => onNavigate('/review')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Review</Text>
        </Pressable>
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <View style={[styles.quickActions, { marginTop: 18 }]}>
        <Pressable
          style={styles.settingsButton}
          onPress={() => onNavigate('/settings')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Settings</Text>
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => onNavigate('/help')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Help & Support</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.bottomSection}>
        <View style={{ marginTop: 8 }} />
        <Pressable
          style={[styles.signOutButton, { backgroundColor: colors.primaryDark, borderColor: colors.border }]}
          onPress={async () => {
            try {
              await onSignOut();
            } catch (err: any) {
              Alert.alert('Sign out failed', err?.message ?? String(err));
            }
          }}
        >
          <Ionicons name="log-out-outline" size={28} color={colors.icon} style={styles.navButtonIcon} />
          <Text style={[styles.signOutText, { color: colors.text }]}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Wrapper component that has access to theme and loading context
function LayoutContent() {
  const router = useRouter();
  const loading = useLoading();
  const { colors } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileInitials, setProfileInitials] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);

  function applySessionUser(session: any | null) {
    if (!session || !session.user) {
      setProfileName('');
      setProfileEmail('');
      setProfileInitials('');
      setUserId(null);
      return;
    }

    const user = session.user;
    setUserId(user.id);

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.username ||
      (user.email ? user.email.split('@')[0] : 'User');

    const email = user.email ?? '';

    const initials = fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join('') || 'U';

    setProfileName(fullName);
    setProfileEmail(email);
    setProfileInitials(initials);
  }

  const refreshStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      loading.start('Updating...');
      const [notes, stats] = await Promise.all([
        fetchNotes(),
        getUserStats(userId)
      ]);
      setNoteCount(notes.length);
      setTasksCompleted(stats.tasks_completed || 0);
    } catch (error: any) {
      console.error('Error refreshing stats:', error?.message ?? error);
    } finally {
      loading.stop();
    }
  }, [userId, loading]);

  async function loadNoteCount() {
    try {
      const notes = await fetchNotes();
      setNoteCount(notes.length);
    } catch (error: any) {
      console.error('Error loading note count:', error?.message ?? error);
    }
  }

  async function loadUserStats(uid: string) {
    try {
      const stats = await getUserStats(uid);
      setTasksCompleted(stats.tasks_completed || 0);
    } catch (error: any) {
      console.error('Error loading user stats:', error?.message ?? error);
    }
  }

  async function checkBiometricLock() {
    try {
      setIsCheckingBiometric(true);
      const lockEnabled = await isBiometricLockEnabled();
      
      if (!lockEnabled) {
        setIsLocked(false);
        setIsCheckingBiometric(false);
        return;
      }

      // Show lock screen and require authentication
      const authenticated = await authenticateWithBiometric();
      setIsLocked(!authenticated);
      setIsCheckingBiometric(false);
    } catch (error) {
      console.error('Error checking biometric lock:', error);
      setIsLocked(false);
      setIsCheckingBiometric(false);
    }
  }

  useEffect(() => {
    // Initialize notifications on app startup
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });

    // Check biometric lock first
    checkBiometricLock();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setShowMenu(true);
        applySessionUser(session);
        router.replace('/home');
        await loadNoteCount();
        if (session.user?.id) {
          await loadUserStats(session.user.id);
        }
      } else {
        setShowMenu(false);
        router.replace('/login');
        setNoteCount(0);
        setTasksCompleted(0);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setShowMenu(true);
          applySessionUser(session);
          router.replace('/home');
          await loadNoteCount();
          if (session.user?.id) {
            await loadUserStats(session.user.id);
          }
        } else {
          setShowMenu(false);
          applySessionUser(null);
          router.replace('/login');
          setNoteCount(0);
          setTasksCompleted(0);
        }
      }
    );

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace('/login');
    setNoteCount(0);
    setTasksCompleted(0);
  }

  async function handleNavigate(path: string) {
    router.push(path);
    setCollapsed(true);
  }

  // Show lock screen if locked
  if (isLocked && !isCheckingBiometric) {
    return (
      <View style={[styles.lockScreen, { backgroundColor: colors.primary }]}>
        <Image
          source={require('../assets/mascot.png')}
          style={styles.lockMascot}
        />
        <Text style={[styles.lockTitle, { color: colors.text }]}>
          BrainDump is Locked
        </Text>
        <TouchableOpacity
          style={[styles.unlockButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={async () => {
            const authenticated = await authenticateWithBiometric();
            if (authenticated) {
              setIsLocked(false);
            }
          }}
        >
          <Ionicons name="finger-print" size={24} color={colors.text} />
          <Text style={[styles.unlockText, { color: colors.text }]}>
            Unlock
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showMenu && (
        <Sidebar
          collapsed={collapsed}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
          noteCount={noteCount}
          tasksCompleted={tasksCompleted}
          profileName={profileName}
          profileEmail={profileEmail}
          profileInitials={profileInitials}
        />
      )}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setCollapsed((s) => !s)}
            style={styles.menuButton}
          >
            {showMenu && <Text style={[{ fontSize: 30 }, { color: colors.text }]}>{'☰'}</Text>}
          </Pressable>
        </View>
        <Slot />
      </View>
    </View>
  );
}

// Main export wraps everything in ThemeProvider and LoadingProvider
export default function RootLayout() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <LayoutContent />
      </LoadingProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 0,
  },

  sidebar: {
    width: 320,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },

  sidebarCollapsed: {
    display: 'none',
  },

  mascotSection: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },

  mascotImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },

  dividerLine: {
    height: 1,
    marginHorizontal: -20,
    alignSelf: 'stretch',
  },

  profileSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    minHeight: 120,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    bottom: -10,
    left: -10,
  },

  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  profileEmail: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  statsWrapper: {
    position: "absolute",
    right: 65,
    bottom: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    fontSize: 15,
    fontWeight: "600",
  },

  navSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 30,
  },

  navButton: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 22,
    height: 44,
  },

  navButtonIcon: {
    position: 'absolute',
    left: 16,
  },

  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  navButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  bottomSection: {
    paddingTop: 12,
    paddingBottom: 60,
    alignItems: 'center',
  },

  quickActions: {
    paddingHorizontal: 16,
    paddingTop: 14,
    alignItems: 'center',
  },

  settingsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '90%',
    marginBottom: 22,
    height: 44,
    justifyContent: 'center',
    flexDirection: 'row',
  },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '85%',
    height: 44,
  },

  signOutIcon: {
    fontSize: 70,
    marginRight: 10,
  },

  signOutIconImage: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },

  signOutText: {
    fontSize: 16,
    fontWeight: '500',
  },

  content: {
    flex: 1,
    marginLeft: 16,
    padding: 18,
  },

  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  menuButton: {
    padding: 8,
  },

  lockScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  lockMascot: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 24,
  },

  lockTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
  },

  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
  },

  unlockText: {
    fontSize: 18,
    fontWeight: '600',
  },
});