// ============================================================
// Supabase client — fill these in once you've created the project.
// Project Settings → API → Project URL / anon public key.
// The anon key is safe to expose in client-side code; RLS policies
// in db/schema.sql control what it's actually allowed to do.
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://epqpnqaezotmlymmhmud.supabase.co'; // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBucWFlem90bWx5bW1obXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjQ0MTcsImV4cCI6MjEwMzQ0MDQxN30.f63VWiH939SdNY4ZkXOFxRV8ji7n3ijPjUD_3OKVuiI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
