// Enhanced Supabase client bootstrapper. We depend on the global `window.supabase`
// UMD bundle (loaded via a <script> tag) instead of importing in this static site.
// This file exposes two globals:
//   window.initSupabase()  -> explicit (re)initialization
//   window.getSupabaseClient() -> lazy getter that auto-initializes
// It validates that env vars were injected (placeholders removed) before creating.

let supabaseClient = null;
let initAttempted = false;

function validateConfig() {
    const url = CONFIG?.SUPABASE_URL;
    const key = CONFIG?.SUPABASE_ANON_KEY;
    if (!url || !key) return { valid: false, reason: 'Missing URL or Anon Key' };
    if (url.includes('%%') || key.includes('%%')) return { valid: false, reason: 'Build placeholders still present' };
    return { valid: true };
}

function createClient() {
    return window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY,
        {
            auth: {
                // Persist session in localStorage (default) but make explicit for clarity.
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: { eventsPerSecond: 20 }
            }
        }
    );
}

function initSupabase(force = false) {
    if (supabaseClient && !force) return supabaseClient;
    initAttempted = true;
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase library not loaded on window');
            return null;
        }
        const { valid, reason } = validateConfig();
        if (!valid) {
            console.warn(`⚠️ Supabase not initialized: ${reason}`);
            return null;
        }
        supabaseClient = createClient();
        console.log('✅ Supabase initialized');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        supabaseClient = null;
        return null;
    }
}

function getSupabaseClient() {
    if (!supabaseClient && !initAttempted) {
        return initSupabase();
    }
    return supabaseClient;
}

// Expose to global scope for existing code expectations
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;

// Optional eager init (comment out if you prefer purely lazy)
initSupabase();
