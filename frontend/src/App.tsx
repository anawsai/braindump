import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; 

export default function App() {
  useEffect(() => {
    async function getNotes() {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) console.error('Error fetching notes:', error);
      else console.log('Notes:', data);
    }
    getNotes();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
