import BackLink from "@/components/BackLink";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{ coachId: string }>;
};

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default async function AthleteConditioningPage({ params }: PageProps) {
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
                .from("conditioning_entries")
                .select("id, day_of_week, exercise, sets, reps, sort_order")
                .eq("coach_id", Number(coachId))
                .order("day_of_week")
                .order("sort_order")
                .order("id"),
        ]);

    if (coachError) {
        return <p className="p-8 text-red-600">Error: {coachError.message}</p>;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <BackLink href={`/athletes/${coachId}`}>Back to Athletes</BackLink>

            <div className="mx-auto max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Weekly Conditioning
                </p>
                <h1 className="mt-2 text-3xl font-bold text-black">
                    {coach.name}&apos;s Group
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                    Your conditioning assignments for Monday through Sunday.
                </p>

                {entriesError ? (
                    <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        Unable to load conditioning: {entriesError.message}
                    </p>
                ) : (
                    <div className="mt-8 grid items-start gap-4 md:grid-cols-2">
                        {DAYS.map((day, index) => {
                            const dayEntries = entries?.filter(
                                (item) => item.day_of_week === index + 1
                            ) ?? [];

                            return (
                                <section
                                    key={day}
                                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                                >
                                    <h2 className="text-lg font-semibold text-black">
                                        {day}
                                    </h2>

                                    {dayEntries.length > 0 ? (
                                        <div className="mt-4 divide-y divide-zinc-100">
                                            {dayEntries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                                >
                                                    <span className="font-medium text-black">
                                                        {entry.exercise}
                                                    </span>
                                                    <span className="shrink-0 text-sm font-semibold text-zinc-700">
                                                        {entry.sets} × {entry.reps}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-zinc-400">
                                            No conditioning assigned.
                                        </p>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
