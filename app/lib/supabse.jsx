import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Use your project URL and anon key here
const SUPABASE_URL = "https://wpaomomrescefzjojzpb.supabase.co";
const SUPABASE_KEY = "sb_secret_DLkc1vDWzMn2vTwlwTHRnA_BycYbbKn"; // normally store in env

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // ✅ fixes "window is not defined"
  },
});



