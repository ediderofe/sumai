// auth-config.js

const SUPABASE_URL = 'https://ffvmaykuinveqckozkvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdm1heWt1aW52ZXFja296a3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDI5MDAsImV4cCI6MjA2MDU3ODkwMH0.12Me7YmwFrcMlxqjnIMAkzBY1DZrkljVd_0rEco9vNA';

// Initialize Supabase client
// Use the global supabase object from the CDN to call createClient
// Assign the result to a constant named supabaseClient
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// You might want to export it if using modules, but for simple scripts,
// making it global like this works, provided this script runs first.
// window._supabase = supabase;

console.log('Supabase client initialized (using supabaseClient variable).');
