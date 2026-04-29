import { createClient } from "@/lib/supabase/server";
import EditRoutinesForm from "./EditRoutinesForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function RoutinesPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: routines } = await supabase
        .from("routines")
        .select("id, athlete_id, compulsory, optional_a, optional_b, notes")
        .eq("athlete_id", Number(athleteId))
        .single();

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold text-black">
                    Edit Routines
                </h1>
                <EditRoutinesForm routines={routines} athleteId={Number(athleteId)} />
            </div>
        </main>
    );
}