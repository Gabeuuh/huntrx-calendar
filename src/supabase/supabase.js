import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  // Aide au debug en dev : on logue clairement le manque de variables
  console.warn("Supabase env manquantes : vérifie VITE_PUBLIC_SUPABASE_URL et VITE_PUBLIC_SUPABASE_KEY");
}

export const supabase = createClient(url || "", key || "");
