import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingProvider } from '../context/LoadingContext';
import { View, Text, Pressable, Alert, StyleSheet, Image } from 'react-native';
import { fetchNotes } from '../lib/api';
import {Ionicons} from "@expo/vector-icons";

function Sidebar({
  collapsed,
  onNavigate,
  onSignOut,
  noteCount,
  profileName,
  profileEmail,
  profileInitials,
}: {
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onSignOut: () => Promise<void>;
  noteCount: number;
  profileName: string;
  profileEmail: string;
  profileInitials: string;
}) {
  if (collapsed) return null;

  return (
    <View style={styles.sidebar}>
      <View style={styles.mascotSection}>
        <Image
          source={require('../assets/mascot.png')}
          style={styles.mascotImage}
        />
      </View>

      <View style={styles.dividerLine} />

      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitials}>{profileInitials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileEmail}>{profileEmail}</Text>
          </View>
        </View>

        <View style={styles.statsWrapper}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={23} color="#000" />
            <Text style={styles.statText}>{noteCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={23} color="#000" />
            <Text style={styles.statText}>5</Text>
          </View>
        </View>
      </View>

      <View style={styles.navSection}>
        <Pressable style={styles.navButton} onPress={() => onNavigate('/dump')}>
          <Text style={styles.navButtonText}>Dump</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => onNavigate('/notes')}
        >
          <Ionicons name="journal" size={25} color="#000" style={styles.navButtonIcon} />
          <Text style={styles.navButtonText}>Notes</Text>
        </Pressable>



        <Pressable
          style={styles.navButton}
          onPress={() => onNavigate('/review')}
        >
          <Text style={styles.navButtonText}>Review</Text>
        </Pressable>
      </View>

      <View style={styles.dividerLine} />

      <View style={[styles.quickActions, { marginTop: 18 }]}>
        <Pressable
          style={styles.settingsButton}
          onPress={() => onNavigate('/settings')}
        >
          <Text style={styles.navButtonText}>Settings</Text>
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => onNavigate('/help')}
        >
          <Text style={styles.navButtonText}>Help & Support</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.bottomSection}>
        <View style={{ marginTop: 8 }} />
        <Pressable
          style={styles.signOutButton}
          onPress={async () => {
            try {
              await onSignOut();
            } catch (err: any) {
              Alert.alert('Sign out failed', err?.message ?? String(err));
            }
          }}
        >
          <Ionicons name="log-out-outline" size={28} color="#000" style={styles.navButtonIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileInitials, setProfileInitials] = useState('');

  function applySessionUser(session: any | null) {
  if (!session || !session.user) {
    setProfileName('');
    setProfileEmail('');
    setProfileInitials('');
    return;
  }

  const user = session.user;

  // Adjust these keys if you used a different field when signing up
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    (user.email ? user.email.split('@')[0] : 'User');

  const email = user.email ?? '';

  // Make initials like "RJ" from "Rachel Jung"
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


  async function loadNoteCount() {
    try {
      const notes = await fetchNotes();
      setNoteCount(notes.length);
    } catch (error: any) {
      console.error('Error loading note count:', error?.message ?? error);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setShowMenu(true);
        applySessionUser(session);
        router.replace('/home');
        await loadNoteCount();
      } else {
        setShowMenu(false);
        router.replace('/login');
        setNoteCount(0);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setShowMenu(true);
          applySessionUser(session);
          router.replace('/home');
          await loadNoteCount();
        } else {
          setShowMenu(false);
          applySessionUser(null);
          router.replace('/login');
          setNoteCount(0);
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
  }

  function handleNavigate(path: string) {
    router.push(path);
    setCollapsed(true);
  }

  return (
    <LoadingProvider>
      <View style={styles.container}>
        {showMenu && (
          <Sidebar
            collapsed={collapsed}
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
            noteCount={noteCount}
            profileName={profileName}
            profileEmail={profileEmail}
            profileInitials={profileInitials}
          />
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => setCollapsed((s) => !s)}
              style={styles.menuButton}
            >
              {showMenu && <Text style={{ fontSize: 30 }}>{'☰'}</Text>}
            </Pressable>
          </View>
          <Slot />
        </View>
      </View>
    </LoadingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },

  sidebar: {
    width: 320,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFB052',
    borderRightWidth: 1,
    borderRightColor: '#000000',
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
    backgroundColor: '#000000',
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
    backgroundColor: '#FF8D05',
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
    color: '#000000',
    marginBottom: 6,
  },

  profileEmail: {
    fontSize: 13,
    color: '#000000',
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
    color: "#000",
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
    color: '#000000',
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
    backgroundColor: '#FF8D05',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
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
    color: '#000000',
  },

  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#e5e5e5',
  },

  menuButton: {
    padding: 8,
  },
});
