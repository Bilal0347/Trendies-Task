import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createClientComponentClient();

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function useSupabaseClient() {
  return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseClient;