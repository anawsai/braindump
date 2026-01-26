import * as Linking from 'expo-linking';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { 
  View, 
  Text, 
  Pressable, 
  Alert, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { fetchNotes, getUserStats } from '../lib/api';
import { Ionicons } from "@expo/vector-icons";
import { initializeNotifications } from '../lib/notifications';
import { isBiometricLockEnabled, authenticateWithBiometric } from '../lib/biometric';

// Pages that should not show navigation (auth pages)
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

// Breakpoint for mobile vs desktop
const MOBILE_BREAKPOINT = 768;

// Sidebar
function Sidebar({
  collapsed,
  onNavigate,
  onSignOut,
  onClose,
  noteCount,
  tasksCompleted,
  profileName,
  profileEmail,
  profileInitials,
  avatarUrl,
  isMobile,
}: {
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onSignOut: () => Promise<void>;
  onClose: () => void;
  noteCount: number;
  tasksCompleted: number;
  profileName: string;
  profileEmail: string;
  profileInitials: string;
  avatarUrl: string | null;
  isMobile: boolean;
}) {
  const { colors } = useTheme();
  
  if (collapsed) return null;

  const sidebarContent = (
    <ScrollView 
      style={[
        styles.sidebarInner, 
        { backgroundColor: colors.sidebar },
        isMobile && styles.sidebarMobile
      ]}
      contentContainerStyle={[styles.sidebarContent, isMobile && styles.sidebarContentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Close button for mobile */}
      {isMobile && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.icon} />
        </Pressable>
      )}

      <View style={styles.mascotSection}>
        <Image
          source={require('../assets/mascot.png')}
          style={[styles.mascotImage, isMobile && styles.mascotImageMobile]}
        />
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <Pressable
        style={styles.profileSection}
        onPress={() => onNavigate('profile')}
      >
        <View style={styles.profileRow}>
          <View style={[styles.profileCircle, { backgroundColor: colors.primaryDark }, isMobile && styles.profileCircleMobile]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
            ) : (
              <Text style={[styles.profileInitials, isMobile && styles.profileInitialsMobile]}>{profileInitials}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }, isMobile && styles.profileNameMobile]}>{profileName}</Text>
            <Text style={[styles.profileEmail, { color: colors.text }, isMobile && styles.profileEmailMobile]} numberOfLines={1}>{profileEmail}</Text>
          </View>
        </View>

        <View style={[styles.statsWrapper, isMobile && styles.statsWrapperMobile]}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={isMobile ? 20 : 23} color={colors.icon} />
            <Text style={[styles.statText, { color: colors.text }]}>{noteCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={isMobile ? 20 : 23} color={colors.icon} />
            <Text style={[styles.statText, { color: colors.text }]}>{tasksCompleted}</Text>
          </View>
        </View>
      </Pressable>

      <View style={[styles.navSection, isMobile && styles.navSectionMobile]}>
        <Pressable style={[styles.navButton, { backgroundColor: colors.card }, isMobile && styles.navButtonMobile]} onPress={() => onNavigate('/dump')}>
          <Text style={[styles.navButtonText, { color: colors.text }]}>Dump</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, { backgroundColor: colors.card }, isMobile && styles.navButtonMobile]}
          onPress={() => onNavigate('/notes')}
        >
          <Ionicons name="journal" size={isMobile ? 22 : 25} color={colors.icon} style={styles.navButtonIcon} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Notes</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, { backgroundColor: colors.card }, isMobile && styles.navButtonMobile]}
          onPress={() => onNavigate('/review')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Review</Text>
        </Pressable>
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <View style={[styles.quickActions, { marginTop: 18 }, isMobile && styles.quickActionsMobile]}>
        <Pressable
          style={[styles.settingsButton, { backgroundColor: colors.card }, isMobile && styles.navButtonMobile]}
          onPress={() => onNavigate('/settings')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Settings</Text>
        </Pressable>

        <Pressable
          style={[styles.settingsButton, { backgroundColor: colors.card }, isMobile && styles.navButtonMobile]}
          onPress={() => onNavigate('/help')}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Help & Support</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, minHeight: 20 }} />

      <View style={[styles.bottomSection, isMobile && styles.bottomSectionMobile]}>
        <Pressable
          style={[styles.signOutButton, { backgroundColor: colors.primaryDark, borderColor: colors.border }, isMobile && styles.signOutButtonMobile]}
          onPress={async () => {
            try {
              await onSignOut();
            } catch (err: any) {
              Alert.alert('Sign out failed', err?.message ?? String(err));
            }
          }}
        >
          <Ionicons name="log-out-outline" size={isMobile ? 24 : 28} color={colors.icon} style={styles.navButtonIcon} />
          <Text style={[styles.signOutText, { color: colors.text }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <View style={styles.mobileOverlay}>
        <Pressable style={styles.mobileBackdrop} onPress={onClose} />
        {sidebarContent}
      </View>
    );
  }

  // Desktop: fixed sidebar
  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.border }]}>
      {sidebarContent}
    </View>
  );
}

// Wrapper component that has access to theme and loading context
function LayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const loading = useLoading();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  
  const isMobile = width < MOBILE_BREAKPOINT;
  
  const [collapsed, setCollapsed] = useState(true); // Start collapsed on mobile
  const [showMenu, setShowMenu] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileInitials, setProfileInitials] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);

  // Check if current page is an auth page (no nav shown)
  const isAuthPage = AUTH_PAGES.some(page => pathname === page || pathname.startsWith(page));
  
  // Check if current page is the homepage (for styling)
  const isHomePage = pathname === '/home';
  
  // Check if current page is delete-note page
  const isDeleteNotePage = pathname.startsWith('/delete-note');
  
  // Pages that need full-bleed styling (no padding/margins)
  const isFullBleedPage = isHomePage || isAuthPage || isDeleteNotePage;

  function applySessionUser(session: any | null) {
    if (!session || !session.user) {
      setProfileName('');
      setProfileEmail('');
      setProfileInitials('');
      setAvatarUrl(null);
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
    setAvatarUrl(user.user_metadata?.avatar_url || null);
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

    // Handle deep links for password reset (mobile only)
    let linkingSubscription: any = null;
    
    if (Platform.OS !== 'web') {
      const handleDeepLink = async (event: { url: string }) => {
        const url = event.url;
        console.log('Deep link received:', url);
        
        // Check if this is a password reset link
        if (url.includes('reset-password') || url.includes('type=recovery')) {
          // Parse tokens from hash fragment manually
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hashPart = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hashPart);
            
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const type = params.get('type');
            
            console.log('Access token found:', !!accessToken);
            console.log('Refresh token found:', !!refreshToken);
            console.log('Type:', type);
            
            if (accessToken && refreshToken) {
              try {
                console.log('Attempting to set session...');
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                console.log('setSession result - data:', !!data);
                console.log('setSession result - error:', error);
                
                if (error) {
                  console.error('Error setting session:', error.message);
                  Alert.alert('Error', error.message);
                  return;
                }
                
                console.log('Session set successfully!');
                setShowMenu(false);
                router.replace('/reset-password');
                return;
              } catch (err) {
                console.error('Error processing reset link:', err);
              }
            }
          }
          
          // No tokens found
          setShowMenu(false);
          router.replace('/reset-password');
        }
      };
    
      // Handle initial URL (app opened via link)
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });
    
      // Handle URLs while app is running
      linkingSubscription = Linking.addEventListener('url', handleDeepLink);
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setShowMenu(true);
        setCollapsed(true); // Ensure sidebar is closed on initial load
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
      async (event, session) => {
        console.log('Auth event:', event);
        
        // Handle PASSWORD_RECOVERY event (works on web)
        if (event === 'PASSWORD_RECOVERY') {
          setShowMenu(false);
          router.replace('/reset-password');
          return;
        }
        
        // Ignore USER_UPDATED events (profile changes) - don't redirect
        if (event === 'USER_UPDATED') {
          if (session) {
            applySessionUser(session);
          }
          return;
        }
        
        // Only redirect on SIGNED_IN or SIGNED_OUT
        if (event === 'SIGNED_IN' && session) {
          setShowMenu(true);
          setCollapsed(true); // Ensure sidebar is closed on login
          applySessionUser(session);
          router.replace('/home');
          await loadNoteCount();
          if (session.user?.id) {
            await loadUserStats(session.user.id);
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          setShowMenu(false);
          applySessionUser(null);
          router.replace('/login');
          setNoteCount(0);
          setTasksCompleted(0);
        }
      }
    );

    return () => {
      sub.subscription.unsubscribe();
      if (linkingSubscription) {
        linkingSubscription.remove();
      }
    };
  }, [router]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace('/login');
    setNoteCount(0);
    setTasksCompleted(0);
  }

  function handleNavigate(path: string) {
    router.push(path);
    // Always collapse on mobile, optionally on desktop
    if (isMobile) {
      setCollapsed(true);
    }
  }

  function handleCloseSidebar() {
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

  // Determine header icon color - white on homepage (orange bg), normal text color elsewhere
  const headerIconColor = isHomePage ? '#FFFFFF' : colors.text;

  // Always use sidebar layout (removed mobile bottom tabs)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isMobile && styles.containerMobile]}>
      {showMenu && !isAuthPage && (
        <Sidebar
          collapsed={collapsed}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
          onClose={handleCloseSidebar}
          noteCount={noteCount}
          tasksCompleted={tasksCompleted}
          profileName={profileName}
          profileEmail={profileEmail}
          profileInitials={profileInitials}
          avatarUrl={avatarUrl}
          isMobile={isMobile}
        />
      )}
      <View style={[
          styles.content, 
          { backgroundColor: colors.background }, 
          isMobile && styles.contentMobile,
          isFullBleedPage && styles.contentFullBleed
        ]}>
        {showMenu && !isAuthPage && !isHomePage && (
          <View style={[
            styles.headerRow, 
            { borderBottomColor: colors.border, backgroundColor: isDeleteNotePage ? colors.primary : 'transparent' }, 
            isMobile && styles.headerRowMobile,
            isDeleteNotePage && styles.headerRowFullBleed,
          ]}>
            <Pressable
              onPress={() => setCollapsed((s) => !s)}
              style={styles.menuButton}
            >
              <Text style={[{ fontSize: 30 }, { color: isDeleteNotePage ? '#1A1A1A' : colors.text }]}>{'☰'}</Text>
            </Pressable>
          </View>
        )}
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

  containerMobile: {
    flexDirection: 'column',
  },

  // Mobile overlay for drawer
  mobileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },

  mobileBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  sidebar: {
    width: 320,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },

  sidebarInner: {
    flex: 1,
  },

  sidebarContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexGrow: 1,
  },

  sidebarContentMobile: {
    paddingTop: 70,
  },

  sidebarMobile: {
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  closeButton: {
    position: 'absolute',
    top: 70,
    right: 12,
    zIndex: 10,
    padding: 8,
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

  mascotImageMobile: {
    width: 80,
    height: 80,
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
    overflow: 'hidden',
  },

  profileCircleMobile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: 0,
    left: 0,
    marginRight: 12,
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileInitialsMobile: {
    fontSize: 18,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  profileNameMobile: {
    fontSize: 16,
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  profileEmailMobile: {
    fontSize: 12,
  },

  statsWrapper: {
    position: "absolute",
    right: 65,
    bottom: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  statsWrapperMobile: {
    position: 'relative',
    right: 0,
    bottom: 0,
    marginTop: 12,
    justifyContent: 'flex-start',
    gap: 20,
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

  navSectionMobile: {
    marginTop: 20,
  },

  navButton: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 22,
    height: 44,
  },

  navButtonMobile: {
    width: '100%',
    marginBottom: 14,
    height: 42,
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

  bottomSection: {
    paddingTop: 12,
    paddingBottom: 60,
    alignItems: 'center',
  },

  bottomSectionMobile: {
    paddingBottom: 30,
  },

  quickActions: {
    paddingHorizontal: 16,
    paddingTop: 14,
    alignItems: 'center',
  },

  quickActionsMobile: {
    paddingHorizontal: 0,
    marginTop: 10,
  },

  settingsButton: {
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

  signOutButtonMobile: {
    width: '100%',
    height: 42,
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

  contentMobile: {
    marginLeft: 0,
    padding: 12,
  },

  contentFullBleed: {
    padding: 0,
    margin: 0,
    marginLeft: 0,
  },

  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  headerRowMobile: {
    height: 100,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
  },

  headerRowFullBleed: {
    borderBottomWidth: 0,
  },

  headerRowHomepage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
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