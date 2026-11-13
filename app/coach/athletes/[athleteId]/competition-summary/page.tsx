import BackLink from "@/components/BackLink";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CompetitionSummaryPage({ params }: {
    params: Promise<{ athleteId: string }>;
}) {
    const { athleteId } = await params;
    const supabase = await createClient();
    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("id, name, level, coach_id")
        .eq("id", Number(athleteId))
        .maybeSingle();

    if (error) return <p className="p-8 text-red-700">Unable to load this athlete’s competition summary. Please try again.</p>;
    if (!athlete) notFound();

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-10 pt-24 text-zinc-950 sm:px-6">
            <BackLink href={`/coach/${athlete.coach_id}/athletes`}>Back</BackLink>
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 border-b border-zinc-200 pb-6">
                    <p className="text-sm font-semibold text-red-700">Competition Summary</p>
                    <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">{athlete.name}</h1>
                    {athlete.level && <span className="mt-3 inline-block rounded-full bg-zinc-950 px-3 py-1 text-sm font-medium text-white">{athlete.level}</span>}
                </header>
                <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-zinc-950">Competition details</h2>
                    <p className="mt-3 text-base leading-7 text-zinc-600">No competition details added yet.</p>
                </section>
            </div>
        </main>
    );
}
