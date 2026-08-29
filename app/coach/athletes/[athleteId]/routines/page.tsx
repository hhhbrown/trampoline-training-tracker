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
        .select("coach_id, name")
        .eq("id", Number(athleteId))
        .single();

    const coachId = athlete?.coach_id;

    const { data: routines } = await supabase
        .from("routines")
        .select("id, athlete_id, compulsory, custom_compulsory, optional_a, optional_a_difficulty, optional_b, optional_b_difficulty, double_mini_set_a, double_mini_set_a_difficulty, double_mini_set_b, double_mini_set_b_difficulty, skills, notes")
        .eq("athlete_id", Number(athleteId))
        .single();

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-10 pt-24">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold text-black">
                    Edit Routines
                </h1>

                <EditRoutinesForm
                    coachId={String(coachId)}
                    athleteId={athleteId}
                    athleteName={athlete?.name ?? ""}
                    routines={routines}
                />
            </div>
        </main>
    );
}
