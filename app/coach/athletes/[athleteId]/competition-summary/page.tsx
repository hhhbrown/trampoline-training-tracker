import WagcRequirements from "@/components/WagcRequirements";
import { WAGC_RULESET_YEAR } from "@/lib/wagc";
import CompetitionRequirements from "@/components/CompetitionRequirements";
import MobilityRequirements from "@/components/MobilityRequirements";
import { competitionSeason, matchCompetitionLevel } from "@/lib/competition-age";
import BackLink from "@/components/BackLink";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CompetitionSummaryPage({ params }: {
    params: Promise<{ athleteId: string }>;
}) {
    const { athleteId } = await params;
    const supabase = await createClient();
    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("id, name, level, coach_id, date_of_birth, gender")
        .eq("id", Number(athleteId))
        .maybeSingle();

    if (error) return <p className="p-8 text-red-700">Unable to load this athlete’s competition summary. Please try again.</p>;
    if (!athlete) notFound();

    const { data: levels, error: levelsError } = await supabase
        .from("competition_levels")
        .select("id, name, discipline, min_age, max_age")
        .eq("discipline", "TRI");
    const season = competitionSeason();
    const sourceLevel = matchCompetitionLevel(levels ?? [], athlete.level, "TRI");
    const [{ data: ddRequirements, error: ddRequirementsError }, { data: routines, error: routinesError }, { data: mobilityRequirements, error: mobilityError }, { data: wagcRequirements, error: wagcError }] = await Promise.all([
        supabase.from("level_dd_requirements").select("level_id, gender, min_dd, max_dd")
            .in("level_id", (levels ?? []).map((level) => level.id)),
        supabase.from("routines").select("compulsory, custom_compulsory, optional_a, optional_a_difficulty, optional_b, optional_b_difficulty")
            .eq("athlete_id", Number(athleteId)).maybeSingle(),
        sourceLevel?.id != null
            ? supabase.from("qualification_requirements")
                .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year")
                .eq("qualification_type", "mobility")
                .eq("source_level_id", sourceLevel.id)
                .eq("ruleset_year", season.endYear)
                .order("id")
            : Promise.resolve({ data: [], error: null }),
        supabase.from("qualification_requirements")
            .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year")
            .eq("qualification_type", "international")
            .eq("ruleset_year", WAGC_RULESET_YEAR)
            .ilike("pathway_name", "%WAGC%")
            .order("id"),
    ]);

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-10 pt-24 text-zinc-950 sm:px-6">
            <BackLink href={`/coach/${athlete.coach_id}/athletes`}>Back</BackLink>
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 border-b border-zinc-200 pb-6">
                    <p className="text-sm font-semibold text-red-700">Competition Summary</p>
                    <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">{athlete.name}</h1>
                </header>
                <CompetitionRequirements
                    dateOfBirth={athlete.date_of_birth}
                    profileLevel={athlete.level}
                    levels={levels ?? []}
                    gender={athlete.gender}
                    year={season.endYear}
                    ddRequirements={ddRequirements ?? []}
                    routines={routines}
                    ddLookupError={ddRequirementsError ? "DD requirements could not be loaded. Check read access to level_dd_requirements." : undefined}
                    routinesError={routinesError ? "Saved routine DD could not be loaded." : undefined}
                    lookupError={levelsError || !levels?.length ? "Competition age requirements could not be loaded. Check that competition_levels is populated and readable by the app." : undefined}
                />
                <MobilityRequirements
                    profileLevel={athlete.level}
                    dateOfBirth={athlete.date_of_birth}
                    gender={athlete.gender}
                    levels={levels ?? []}
                    year={season.endYear}
                    requirements={mobilityRequirements ?? []}
                    routines={[
                        { name: "Optional A", value: routines?.optional_a ?? null, difficulty: routines?.optional_a_difficulty ?? null },
                        { name: "Optional B", value: routines?.optional_b ?? null, difficulty: routines?.optional_b_difficulty ?? null },
                    ]}
                    error={levelsError ? "Competition levels could not be loaded." : mobilityError ? "Mobility requirements could not be loaded. Check read access to qualification_requirements." : undefined}
                    routinesError={routinesError ? "Saved routines could not be loaded." : undefined}
                />
                <WagcRequirements
                    requirements={wagcRequirements ?? []}
                    dateOfBirth={athlete.date_of_birth}
                    gender={athlete.gender}
                    profileLevel={athlete.level}
                    routines={[
                        { name: "Optional A", value: routines?.optional_a ?? null, difficulty: routines?.optional_a_difficulty ?? null },
                        { name: "Optional B", value: routines?.optional_b ?? null, difficulty: routines?.optional_b_difficulty ?? null },
                    ]}
                    error={wagcError ? "WAGC requirements could not be loaded. Check read access to qualification_requirements." : undefined}
                    routinesError={routinesError ? "Saved routine DD could not be loaded." : undefined}
                />
            </div>
        </main>
    );
}
