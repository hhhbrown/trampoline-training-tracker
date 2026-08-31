import BackLink from "@/components/BackLink";
import RoutineProgressDashboard from "@/components/RoutineProgressDashboard";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function CoachAthleteProgressPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("id, name, level, coach_id")
        .eq("id", Number(athleteId))
        .single();

    if (athleteError) {
        return <p className="p-8 text-red-600">Error: {athleteError.message}</p>;
    }

    const { data: progress, error: progressError } = await supabase
        .from("routine_progress")
        .select("id, recorded_at, routine_type, difficulty, completed_count")
        .eq("athlete_id", Number(athleteId))
        .order("recorded_at", { ascending: false });

    if (progressError) {
        return <p className="p-8 text-red-600">Error: {progressError.message}</p>;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <div className="mx-auto max-w-7xl">
                <BackLink href={`/coach/${athlete.coach_id}/athletes`}>
                    Back to Athletes
                </BackLink>

                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Coach View
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">
                        {athlete.name}
                    </h1>
                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        {athlete.level}
                    </div>
                </div>

                <section>
                    <h2 className="text-3xl font-bold tracking-tight text-black">
                        Routine dashboard
                    </h2>
                    <p className="mt-2 text-zinc-600">
                        Track routine volume, difficulty, and recent training activity.
                    </p>
                    <RoutineProgressDashboard progress={progress ?? []} />
                </section>
            </div>
        </main>
    );
}
