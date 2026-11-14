import BackLink from "@/components/BackLink";
import { createClient } from "@/lib/supabase/server";
import DailyDrillsWeek from "./DailyDrillsWeek";

type PageProps = {
    params: Promise<{ coachId: string }>;
};

export default async function DailyDrillsPage({ params }: PageProps) {
    const { coachId } = await params;
    const supabase = await createClient();

    const [{ data: coach, error: coachError }, { data: entries, error: entriesError }] =
        await Promise.all([
            supabase
                .from("coaches")
                .select("name")
                .eq("id", Number(coachId))
                .single(),
            supabase
                .from("daily_drills")
                .select("id, coach_id, day_of_week, exercise")
                .eq("coach_id", Number(coachId))
                .order("day_of_week")
                .order("id"),
        ]);

    if (coachError) {
        return <p className="p-8 text-red-600">Error: {coachError.message}</p>;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <BackLink href={`/coach/${coachId}/athletes`}>
                Back
            </BackLink>

            <div className="mx-auto max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Daily Drills
                </p>
                <h1 className="mt-2 text-3xl font-bold text-black">
                    {coach.name}&apos;s Group
                </h1>

                {entriesError ? (
                    <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        Unable to load daily drills: {entriesError.message}
                    </p>
                ) : (
                    <DailyDrillsWeek
                        coachId={Number(coachId)}
                        initialEntries={entries ?? []}
                    />
                )}
            </div>
        </main>
    );
}
