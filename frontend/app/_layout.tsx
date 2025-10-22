import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';

function Sidebar({ collapsed, onNavigate, onSignOut }: { collapsed: boolean; onNavigate: (path: string) => void; onSignOut: () => Promise<void> }) {
  return (
    <View style={[styles.sidebar, collapsed ? styles.sidebarCollapsed : null]}>
      <Text>BrainDump</Text>
      <Pressable style={styles.link} onPress={() => onNavigate('/home')}>
        <Text style={styles.linkText}>{collapsed ? 'H' : 'Home'}</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => onNavigate('/dump')}>
        <Text style={styles.linkText}>{collapsed ? 'N' : 'Dump'}</Text>
      </Pressable>

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
  container: { 
    flex: 1, 
    flexDirection: 'row' 
  },

  sidebar: { 
    width: 160, 
    padding: 16, 
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

  headerRow: { 
    height: 52, 
    justifyContent: 'flex-start', 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
  },

  menuButton: { 
    padding: 8 
  },
});
