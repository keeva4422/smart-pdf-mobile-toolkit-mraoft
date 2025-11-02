import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ktkvgevsclsfwhdcqplq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0a3ZnZXZzY2xzZndoZGNxcGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODMyMTAsImV4cCI6MjA3NzY1OTIxMH0.Tf1unvPwCAsGKfukuMdTRObbErISREMVjNVBDJ2Gpx4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
