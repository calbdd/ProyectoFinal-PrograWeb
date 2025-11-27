import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = "https://idsiwnraappgccvmdgps.supabase.co"

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2l3bnJhYXBwZ2Njdm1kZ3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTkzODUsImV4cCI6MjA3OTQ5NTM4NX0.K0AwNCHqiPtQZWjXQ6eE612s37IKHmaK_SD2cR198oU"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)



