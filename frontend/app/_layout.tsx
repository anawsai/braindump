import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';

<<<<<<< Updated upstream
function Sidebar({ collapsed, onNavigate, onSignOut }: { collapsed: boolean; onNavigate: (path: string) => void; onSignOut: () => Promise<void> }) {
<<<<<<< Updated upstream
  return (
    <View style={[styles.sidebar, collapsed ? styles.sidebarCollapsed : null]}>
      <Text>BrainDump</Text>
      <Pressable style={styles.link} onPress={() => onNavigate('/home')}>
        <Text style={styles.linkText}>Home</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => onNavigate('/dump')}>
        <Text style={styles.linkText}>Dump</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => onNavigate('/notes')}>
        <Text style={styles.linkText}>Notes</Text>
      </Pressable>
=======
=======
>>>>>>> Stashed changes
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
            <Text style={styles.profileInitials}>JJ</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Jeffrey Jones</Text>
            <Text style={styles.profileEmail}>jeffreyjones@gmail.com</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Image source={require('../assets/23.png')} style={styles.statIconImage} />
            <Text style={styles.statNumber}>23</Text>
          </View>
          <View style={styles.stat}>
            <Image source={require('../assets/checkmark.png')} style={styles.statIconImage} />
            <Text style={styles.statNumber}>5</Text>
          </View>
          <View style={styles.stat}>
            <Image source={require('../assets/person.png')} style={styles.statIconImage} />
            <Text style={styles.statNumber}>8</Text>
          </View>
        </View>
      </View>

      <View style={styles.navSection}>
        <Pressable style={styles.navButton} onPress={() => onNavigate('/dump')}>
          <Text style={styles.navButtonText}>Dump</Text>
        </Pressable>
        
        <Pressable style={[styles.navButton, styles.navButtonActive]} onPress={() => onNavigate('/notes')}>
          <Image source={require('../assets/notes.png')} style={styles.navButtonIconImage} />
          <Text style={styles.navButtonText}>Notes</Text>
        </Pressable>
        
        <Pressable style={styles.navButton} onPress={() => onNavigate('/review')}>
          <Text style={styles.navButtonText}>Review</Text>
        </Pressable>
        
        <Pressable style={styles.navButton} onPress={() => onNavigate('/teams')}>
          <Text style={styles.navButtonText}>Teams</Text>
        </Pressable>
      </View>

      <View style={styles.dividerLine} />

      <View style={[styles.quickActions, { marginTop: 18 }]}>
        <Pressable style={styles.settingsButton} onPress={() => onNavigate('/settings')}>
          <Text style={styles.navButtonText}>Settings</Text>
        </Pressable>
        
        <Pressable style={styles.settingsButton} onPress={() => onNavigate('/help')}>
          <Text style={styles.navButtonText}>Help & Support</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        style={[styles.link, { backgroundColor: '#fff3f3', borderColor: '#ffdddd' }]}
        onPress={async () => {
          try {
            await onSignOut();
          } catch (err: any) {
            Alert.alert('Sign out failed', err?.message ?? String(err));
          }
        }}
      >
        <Text style={[styles.linkText, { color: '#b00020' }]}>{collapsed ? '⎋' : 'Sign out'}</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // check auth when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setShowMenu(true);
        router.replace('/home');
      } else {
        setShowMenu(false);
        router.replace('/auth');
      }
    });

    // check for sign-in / sign-out
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setShowMenu(true);
        router.replace('/home');
      } else {
        setShowMenu(false);
        router.replace('/auth');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace('/auth');
  }

  function handleNavigate(path: string) {
    router.push(path);
  }

  return (
    <View style={styles.container}>
      {showMenu && (<Sidebar collapsed={collapsed} onNavigate={handleNavigate} onSignOut={handleSignOut} />)}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setCollapsed((s) => !s)} style={styles.menuButton}>
            {showMenu && <Text style={{ fontSize: 20 }}>{collapsed ? '☰' : '☰'}</Text>}
          </Pressable>
        </View>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  container: { 
    flex: 1, 
<<<<<<< Updated upstream
    flexDirection: 'row' 
  },

  sidebar: { 
    width: 160, 
    padding: 16, 
=======
    flexDirection: 'row', 
=======
  container: {
    flex: 1,
    flexDirection: 'row',
>>>>>>> Stashed changes
    backgroundColor: '#ffffff',
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
    display: 'none'
  },

  link: { 
    paddingVertical: 10, 
    paddingHorizontal: 8, 
    marginBottom: 8 
  },

  linkText: { 
    fontSize: 16 
  },

  content: { 
    flex: 1 
  },
<<<<<<< Updated upstream

  headerRow: { 
    height: 52, 
    justifyContent: 'flex-start', 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
=======
  
  profileSection: { 
    paddingVertical: 8,
    paddingHorizontal: 4,
>>>>>>> Stashed changes
  },

  menuButton: { 
    padding: 8 
  },
<<<<<<< Updated upstream
});
=======

  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8D05',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  profileInitials: {
    fontSize: 20,
    fontWeight: 700,
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

  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    marginTop: 8,
  },

  stat: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginRight: 18,
  },

  statIcon: { 
    fontSize: 18,
    marginRight: 6,
  },


  statIconImage: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },

  statNumber: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#000000',
  },

  navSection: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginTop: 28,
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
    paddingHorizontal: 12,
    marginBottom: 22,
    height: 44,
  },

  navButtonIcon: {
    position: 'absolute',
    left: 12,
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#000000',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    fontSize: 18,
  },

  navButtonIconImage: {
    position: 'absolute',
    left: 12,
    top: 6,             
    width: 28,
    height: 28,
    resizeMode: 'contain',
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
    marginTop: 0,
  },

  quickActions: {
    paddingHorizontal: 16,
    paddingTop: 14,         
  },


  settingsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '85%',
    marginBottom: 22,
    height: 44,
    justifyContent: 'center', 
  },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8D05',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '85%',
    height: 44,
  },

  signOutIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  signOutIconImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },

  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  content: { 
    flex: 1, 
    backgroundColor: '#ffffff',
    marginLeft: 16,
    padding: 18,
  },

<<<<<<< Updated upstream
  headerRow: { 
    height: 52, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
=======
  profileSection: {
    paddingVertical: 8,
    paddingHorizontal: 4,
>>>>>>> Stashed changes
  },

  menuButton: { 
    padding: 8, 
  },
});
>>>>>>> Stashed changes
