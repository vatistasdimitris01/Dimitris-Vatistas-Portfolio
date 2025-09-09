
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://dgyxomonccjcbwwaqskw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRneXhvbW9uY2NqY2J3d2Fxc2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTE5NjgsImV4cCI6MjA3MzAyNzk2OH0.FlN5-D7NGWulWYiItUjo7pudctjLNzSwGxhyhhs3jE4';

// We've replaced the environment variable logic with the actual credentials
// provided by the user. This will resolve the configuration errors.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
