/* ========================================
   AENDRA — Supabase Client
   ======================================== */

const SUPABASE_URL = 'https://ffwuvaifwqjpkntfrppm.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmd3V2YWlmd3FqcGtudGZycHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODQ3ODcsImV4cCI6MjA5MTI2MDc4N30.nc2FSGTcOKSP8_KGL9Yus-B6zKKvVYZmSX5_RCRZMCQ';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
