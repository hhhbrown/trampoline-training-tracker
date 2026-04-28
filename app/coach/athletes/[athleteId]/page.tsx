import { createClient } from "@/lib/supabase/server";
import EditAthleteForm from "./EditAthleteForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function CoachEditAthletePage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("id, name, level, coach_id")
        .eq("id", Number(athleteId))
        .single();

    const { data: coaches } = await supabase
        .from("coaches")
        .select("id, name")
        .order("id");

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach Edit
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Edit Athlete
                </h1>

                <EditAthleteForm athlete={athlete} coaches={coaches ?? []} />
            </div>
        </main>
    );
}