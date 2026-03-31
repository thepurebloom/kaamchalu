import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://biytwqtyjfkaudzblbyy.supabase.co";  // ✅ FIXED
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeXR3cXR5amZrYXVkemJsYnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDI5MDIsImV4cCI6MjA4OTkxODkwMn0.z6oQiX6SaJdCDLFaU4agMcj_8ntAwno9Xi5vUTtWKqg"; // keep your same key

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;