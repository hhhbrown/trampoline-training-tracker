import { supportsNationals } from "@/lib/nationals";
import NationalsRequirements from "./NationalsRequirements";
import { competesInEvent } from "@/lib/athlete-events";
import { loadDmtSets } from "@/lib/dmt-sets";
import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { dmtNationalsRounds } from "@/lib/dmt-nationals";
import { createClient } from "@/lib/supabase/server";

export default async function DmtNationalsRequirements({ athlete, year }: {
    athlete: { id: number; dmt_level: string | null; gender: string | null }; year: number;
}) {
    if (!competesInEvent(athlete.dmt_level) || !supportsNationals(athlete.dmt_level)) return null;
    const client = await createClient();
    const [levels, requirements, sets, lookup] = await Promise.all([
        client.from("competition_levels").select("id, name, discipline, min_age, max_age").eq("discipline", "DMT"),
        client.from("qualification_requirements")
            .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year, discipline")
            .eq("qualification_type", "nationals").eq("discipline", "DMT").eq("ruleset_year", year).order("id"),
        loadDmtSets(client, athlete.id, athlete.dmt_level),
        loadDmtDDLookup(client),
    ]);
    return <NationalsRequirements discipline="DMT" profileLevel={athlete.dmt_level} gender={athlete.gender}
        levels={levels.data ?? []} year={year} requirements={requirements.data ?? []}
        routines={dmtNationalsRounds(sets.drafts, lookup.entries)}
        error={levels.error || requirements.error ? "DMT Canadian Championships standards could not be loaded. Check database read permissions." : undefined}
        routinesError={sets.error ?? lookup.error ?? undefined} />;
}
