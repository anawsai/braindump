import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ekbtuwvsiuvahcdcxtqc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYnR1d3ZzaXV2YWhjZGN4dHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTQxODgsImV4cCI6MjA3NTI3MDE4OH0.HVxR5L1rcWQ_IMUk9-S6NWcOeu5s84uZ1eU_QEXppPI'

// For React Native / Expo, you must specify a custom storage adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // must be false for React Native
  },
})
