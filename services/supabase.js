import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmmtdshapymhnfywolln.supabase.co'; // Reemplaza con tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbXRkc2hhcHltaG5meXdvbGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDU4NzcsImV4cCI6MjA3ODAyMTg3N30.jZ3FI2_RyFapA-c1XK5V84FaTaZSwfPvWd2ngXefj0M'; // Reemplaza con tu anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);