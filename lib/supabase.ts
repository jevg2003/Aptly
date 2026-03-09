import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fohcutrrhrihvzrvynxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaGN1dHJyaHJpaHZ6cnZ5bnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjc2MzUsImV4cCI6MjA4ODY0MzYzNX0.IqPHkCuaP-ohUH_JlF-zyXjR1wInXDplzmBj0upfxoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
