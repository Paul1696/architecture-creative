// Supabase Configuration
(() => {
  const SUPABASE_URL = 'https://sheaawdmrsvdghcbicrx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZWFhd2RtcnN2ZGdoY2JpY3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzI4MDAsImV4cCI6MjA5MzA0ODgwMH0.6nZ4ZS3I7faGwEMoOFanKSTuwz9KE_xSB2gJUqsPEBQ';

  if (!window.supabase?.createClient) {
    console.warn('Supabase JS client is not loaded.');
    return;
  }

  window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
  window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
