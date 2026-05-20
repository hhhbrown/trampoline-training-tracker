import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-red-400 px-4 py-10">

            <Link
                href="/coach"
                className="inline-flex items-center text-sm text-zinc-600 hover:text-black"
            >
                ← Back
            </Link>
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach View
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Athlete Group
                </h1>

                {error && (
                    <p className="mt-4 text-red-600">
                        Error: {error.message}
                    </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {athletes?.map((athlete) => (
                        <div
                            key={athlete.id}
                            className="relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                        >
                            <Link
                                href={`/coach/athletes/${athlete.id}`}
                                className="absolute top-4 right-4 rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                            >
                                Edit Athlete
                            </Link>

                            <h2 className="font-semibold text-black">{athlete.name}</h2>
                            <p className="mt-1 text-sm text-zinc-600">{athlete.level}</p>

                            <div className="mt-6 space-y-2">
                                <Link
                                    href={`/coach/athletes/${athlete.id}/plan`}
                                    className="block w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white text-center hover:bg-zinc-800"
                                >
                                    Edit Plan
                                </Link>

                                <Link
                                    href={`/coach/athletes/${athlete.id}/routines`}
                                    className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black text-center hover:bg-zinc-100"
                                >
                                    Edit Routines
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