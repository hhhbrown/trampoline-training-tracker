import { createClient } from "@/lib/supabase/server";
import EditRoutinesForm from "./EditRoutinesForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function RoutinesPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete } = await supabase
        .from("athletes")
        .select("coach_id, name, dmt_level")
        .eq("id", Number(athleteId))
        .single();

    const coachId = athlete?.coach_id;

    const { data: routines } = await supabase
        .from("routines")
        .select("id, athlete_id, compulsory, custom_compulsory, optional_a, optional_a_difficulty, optional_b, optional_b_difficulty, double_mini_set_a, double_mini_set_a_difficulty, double_mini_set_b, double_mini_set_b_difficulty, skills, notes")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: ddLookup, error: ddLookupError } = await supabase
        .from("dd_lookup")
        .select("fig_code, difficulty");

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-10 pt-24 text-zinc-950 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-black">
                    Edit Routines
                </h1>

                <EditRoutinesForm
                    coachId={String(coachId)}
                    athleteId={athleteId}
                    athleteName={athlete?.name ?? ""}
                    routines={routines}
                    dmtLevel={athlete?.dmt_level ?? null}
                    ddLookup={ddLookup ?? []}
                    ddLookupError={ddLookupError
                        ? "Unable to load the DD lookup table. Enter DD manually or reload to try again."
                        : !ddLookup?.length
                          ? "No DD lookup entries are visible to the app. Check that the table is populated and its read policy allows access. You can still enter DD manually."
                          : undefined}
                />
            </div>
        </main>
    );
}
