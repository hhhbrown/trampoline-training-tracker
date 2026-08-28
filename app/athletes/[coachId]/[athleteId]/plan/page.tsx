import { createClient } from "@/lib/supabase/server";
import DailyPlanForm from "./DailyPlanForm";
import BackLink from "@/components/BackLink";

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

    const { data: plan } = await supabase
        .from("plans")
        .select("id, week")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: planItems } = plan
        ? await supabase
            .from("plan_items")
            .select("id, name, target")
            .eq("plan_id", plan.id)
            .order("id")
        : { data: [] };

    const { data: logs } = await supabase
        .from("training_logs")
        .select("plan_item_id, completed, comments, created_at")
        .eq("athlete_id", Number(athleteId))
        .order("created_at", { ascending: false });

    const latestByItem = new Map();

    logs?.forEach((log) => {
        if (!latestByItem.has(log.plan_item_id)) {
            latestByItem.set(log.plan_item_id, log);
        }
    });

    const initialCheckedItems = Array.from(latestByItem.values())
        .filter((log) => log.completed)
        .map((log) => log.plan_item_id);

    const initialComments = logs?.[0]?.comments ?? "";

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <div className="mx-auto max-w-2xl">
                <BackLink href={`/athletes/${coachId}/${athleteId}`}>
                    Back to Dashboard
                </BackLink>

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
                    <h2 className="text-xl font-semibold text-black">Daily Plan</h2>

                    <DailyPlanForm
                        athleteId={athleteId}
                        planItems={planItems ?? []}
                        initialCheckedItems={initialCheckedItems}
                        initialComments={initialComments}
                    />
                </section>
            </div>
        </main>
    );
}
