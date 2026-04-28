import { createClient } from "@/lib/supabase/server";
import EditPlanForm from "./EditPlanForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function CoachEditPlanPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("id", Number(athleteId))
        .single();

    const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: planItems } = await supabase
        .from("plan_items")
        .select("id, name, target")
        .eq("plan_id", plan?.id)
        .order("id");

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach Edit
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    {athlete?.name}
                </h1>

                <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                    {athlete?.level}
                </div>

                <EditPlanForm planItems={planItems ?? []} planId={plan!.id} />
            </div>
        </main>
    );
}