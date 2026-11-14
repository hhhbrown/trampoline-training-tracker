import MobilityRequirements from "./MobilityRequirements";
import { matchCompetitionLevel } from "@/lib/competition-age";
import { supportsMobility } from "@/lib/mobility";
import { loadDmtSets } from "@/lib/dmt-sets";
import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { createClient } from "@/lib/supabase/server";

export default async function DmtMobilityRequirements({ athlete, year }: {
    athlete: { id: number; dmt_level: string | null; gender: string | null; date_of_birth: string | null }; year: number;
}) {
    if (!supportsMobility(athlete.dmt_level ?? "")) return null;
    const client = await createClient();
    const [levels, sets, lookup] = await Promise.all([
        client.from("competition_levels").select("id, name, discipline, min_age, max_age").eq("discipline", "DMT"),
        loadDmtSets(client, athlete.id, athlete.dmt_level),
        loadDmtDDLookup(client),
    ]);
    const source = matchCompetitionLevel(levels.data ?? [], athlete.dmt_level, "DMT");
    const requirements = source?.id != null ? await client.from("qualification_requirements")
        .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year, discipline")
        .eq("qualification_type", "mobility").eq("discipline", "DMT").eq("source_level_id", source.id).eq("ruleset_year", year).order("id")
        : { data: [], error: null };
    return <MobilityRequirements discipline="DMT" profileLevel={athlete.dmt_level} dateOfBirth={athlete.date_of_birth}
        gender={athlete.gender} levels={levels.data ?? []} year={year} requirements={requirements.data ?? []}
        routines={[]} dmtSets={sets.drafts} dmtDDLookup={lookup.entries}
        error={levels.error || requirements.error ? "DMT mobility requirements could not be loaded. Check database read permissions." : undefined}
        routinesError={sets.error ?? lookup.error ?? undefined} />;
}
