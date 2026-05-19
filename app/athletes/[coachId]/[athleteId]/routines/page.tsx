import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compulsorySkills } from "@/lib/compulsories";

type PageProps = {
    params: Promise<{
        coachId: string;
        athleteId: string;
    }>;
};

export default async function AthleteRoutinesPage({ params }: PageProps) {
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

    const { data: routines, error: routinesError } = await supabase
        .from("routines")
        .select("id, athlete_id, compulsory, optional_a, optional_b, notes")
        .eq("athlete_id", Number(athleteId))
        .maybeSingle();

    if (routinesError) {
        return <p className="p-8 text-red-600">Error: {routinesError.message}</p>;
    }

    const skills = compulsorySkills[routines?.compulsory ?? ""] ?? [];

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
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="text-base font-semibold text-black">
                                {routines?.compulsory ?? "Compulsory"}
                            </h3>

                            {skills.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                    {skills.map((skill) => (
                                        <li key={skill} className="text-sm text-zinc-700">
                                            • {skill}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 text-sm text-zinc-400">
                                    No compulsory routine selected yet.
                                </p>
                            )}
                        </div>

                        <RoutineCard title="Optional A" value={routines?.optional_a} />
                        <RoutineCard title="Optional B" value={routines?.optional_b} />
                        <RoutineCard title="Notes" value={routines?.notes} />
                    </div>
                </section>
            </div>
        </main>
    );
}

function RoutineCard({
    title,
    value,
}: {
    title: string;
    value: string | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold text-black">{title}</h3>

            {value ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                    {value}
                </p>
            ) : (
                <p className="mt-2 text-sm text-zinc-400">Not added yet.</p>
            )}
        </div>
    );
}