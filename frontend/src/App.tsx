import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'

// PAGE IMPORTS -- add pages here
import Note from './pages/Note'
import Auth from './pages/Auth'

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.log('Error signing out:', error.message)
  }

  return (
    <View>
      {!session && <Auth />}
      {session && session.user && (
        <Text onPress={handleSignOut}>
          Sign Out
        </Text>
      )}
      {session && session.user && <Note />}
    </View>
  )
}