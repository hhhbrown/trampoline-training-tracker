import { TeamSection } from "./NationalTeamRequirements";
import { NATIONAL_TEAM_RULESET_YEAR, supportsNationalTeam } from "@/lib/national-team";
import { loadDmtSets } from "@/lib/dmt-sets";
import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { dmtWagcRounds } from "@/lib/dmt-nationals";
import { createClient } from "@/lib/supabase/server";

export default async function DmtNationalTeamRequirements({ athlete, year }: {
    athlete: { id: number; dmt_level: string | null; gender: string | null; date_of_birth: string | null }; year: number;
}) {
    if (!supportsNationalTeam(athlete.dmt_level, "DMT")) return null;
    const client = await createClient();
    const [requirements, sets, lookup] = await Promise.all([
        client.from("qualification_requirements")
            .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year, discipline")
            .eq("qualification_type", "international").eq("discipline", "DMT").eq("ruleset_year", NATIONAL_TEAM_RULESET_YEAR)
            .ilike("pathway_name", "National Team%"),
        loadDmtSets(client, athlete.id, athlete.dmt_level),
        loadDmtDDLookup(client),
    ]);
    return <TeamSection discipline="DMT" profileLevel={athlete.dmt_level} athlete={athlete} year={year}
        requirements={requirements.data ?? []} routines={dmtWagcRounds(sets.drafts, lookup.entries)}
        error={requirements.error ? "DMT National Team standards could not be loaded. Check database read permissions." : sets.error ?? lookup.error ?? undefined} />;
}
