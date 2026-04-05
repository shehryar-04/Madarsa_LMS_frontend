import { createClient } from '@supabase/supabase-js'

// Replace these with your own Supabase project values
const SUPABASE_URL = 'https://gzrvlccmvaovampbohqy.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_cKo2_lkbqmb9ohvLGd7Iig_xihLmZW3'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)