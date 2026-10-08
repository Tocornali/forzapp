import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uelfvlmpkurlthuezqth.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbGZ2bG1wa3VybHRodWV6cXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTQyOTUsImV4cCI6MjEwNjEzMDI5NX0.n4A_ffBkdW9FXXIYzZ3tm60QuNL7pDMQdtzD7UVCyMY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
