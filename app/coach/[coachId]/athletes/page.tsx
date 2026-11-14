import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BackLink from "@/components/BackLink";

type PageProps = {
    params: Promise<{ coachId: string }>;
};

export default async function CoachAthletesPage({ params }: PageProps) {
    const { coachId } = await params;

    const supabase = await createClient();

    const { data: athletes, error } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("coach_id", Number(coachId))
        .order("name");
    
    const { data : coach } = await supabase
        .from("coaches")
        .select("name")
        .eq("id", Number(coachId))
        .single();

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-red-400 px-4 pb-10 pt-24">

            <BackLink
                href="/coach"
            >
                Back
            </BackLink>

            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Shasta Trampoline Club
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    {coach?.name}&apos;s Group
                </h1>
                <div className="mt-5 mb-8 flex flex-wrap gap-3">
                    <Link
                        href={`/coach/${coachId}/conditioning`}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Conditioning
                    </Link>
                    <Link
                        href={`/coach/${coachId}/daily-drills`}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Daily Drills
                    </Link>
                    <Link
                        href={`/coach/${coachId}/print-plans`}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                    >
                        Print Plans
                    </Link>
                </div>
                {error && (
                    <p className="mt-4 text-red-600">
                        Error: {error.message}
                    </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {athletes?.map((athlete) => (
                        <div
                            key={athlete.id}
                            className="rounded-xl border border-red-200 bg-[#fffaf0] p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="break-words text-xl font-bold leading-tight text-black">{athlete.name}</h2>
                                    {athlete.level && <p className="mt-2 inline-block rounded-md bg-black px-2 py-1 text-sm font-semibold text-white">{athlete.level}</p>}
                                </div>
                                <Link
                                    href={`/coach/athletes/${athlete.id}`}
                                    className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                                >
                                    Edit Athlete
                                </Link>
                            </div>

                            <div className="mt-6 space-y-2">
                                <Link
                                    href={`/coach/athletes/${athlete.id}/plan`}
                                    className="block w-full rounded-lg bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                                >
                                    Edit Plan
                                </Link>

                                <Link
                                    href={`/coach/athletes/${athlete.id}/routines`}
                                    className="block w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                                >
                                    Edit Routines
                                </Link>

                                <Link
                                    href={`/coach/athletes/${athlete.id}/progress`}
                                    className="block w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                                >
                                    View Progress
                                </Link>
                                <Link
                                    href={`/coach/athletes/${athlete.id}/competition-summary`}
                                    className="block w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-900 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                                >
                                    Competition Summary
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-10 flex justify-left">
                    <Link
                        href={`/coach/${coachId}/athletes/new`}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        + Add Athlete
                    </Link>
                </div>
            </div>
        </main>
    );
}
