import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tzdzzgfjegtjsfbjdjxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZHp6Z2ZqZWd0anNmYmpkanh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODk2NTcsImV4cCI6MjEwMDE2NTY1N30.jqGqvAtJfDdDDiDOWfKgxsSb369hBnc63c_fRNqohHg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);