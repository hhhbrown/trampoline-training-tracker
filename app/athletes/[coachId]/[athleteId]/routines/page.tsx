import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    coachId: string;
    athleteId: string;
  }>;
};

export default async function AthletePlanPage({ params }: PageProps) {
  const { coachId, athleteId } = await params;
  const supabase = await createClient();


    const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("id", Number(athleteId))
        .single();

    if (athleteError) {
        return <p className="p-8 text-red-600">Error: {athleteError.message}</p>;
    }

    const { data: routines } = await supabase
        .from("routines")
        .select("id, name, skills")
        .eq("athlete_id", Number(athleteId))
        .order("id");

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <Link
                    href={`/athletes/${coachId}/${athleteId}`}
                    className="mb-6 inline-block text-sm font-medium text-red-600 underline"
                >
                    ← Back to Dashboard
                </Link>

                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Athlete Profile
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-black">
                        {athlete.name}
                    </h1>

                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        {athlete.level}
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-semibold text-black">Routines</h2>

                    <div className="mt-4 space-y-4">
                        {routines && routines.length > 0 ? (
                            routines.map((routine) => (
                                <div
                                    key={routine.id}
                                    className="rounded-xl border border-zinc-200 bg-white p-4"
                                >
                                    <h3 className="text-base font-semibold text-black">
                                        {routine.name}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                                        {routine.skills}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-zinc-200 bg-white p-4">
                                <p className="text-sm text-zinc-500">
                                    No routines available.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}