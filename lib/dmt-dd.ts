import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateDD, type DDLookupEntry } from "./dd";
import type { DmtPassDraft } from "./dmt-sets";

export function calculateDmtDD(pass: DmtPassDraft, lookup: DDLookupEntry[]) {
    const result = calculateDD([pass.firstCode, pass.dismountCode].join("\n"), lookup);
    return { ...result, complete: Boolean(pass.firstCode.trim() && pass.dismountCode.trim()) };
}

export async function loadDmtDDLookup(client: SupabaseClient) {
    const { data, error } = await client.from("dmt_dd_lookup").select("fig_code, difficulty");
    return {
        entries: (data ?? []) as DDLookupEntry[],
        error: error || !data?.length ? "Automatic DMT DD is unavailable. Check that dmt_dd_lookup is populated and readable by the app." : null,
    };
}
