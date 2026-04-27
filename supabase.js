const SUPABASE_URL = 'https://wstkwanidmxjsqhwszjv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdGt3YW5pZG14anNxaHdzemp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDE3NjQsImV4cCI6MjA4NjMxNzc2NH0.BIoYH5k6s9iF2rWfjHA3f6rD-McyqKYQ4snzTXjTSrg';

if (!window.supabase) {
    console.error('Error: La librería de Supabase no cargó correctamente.');
}
// Forzando DEMO MODE para que la aplicación no tenga delay de red
window.hSupabase = null; // window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
