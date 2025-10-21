import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    //check auth when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/auth');
      }
    });

    //check for sign-in / sign-out 
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/auth');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
