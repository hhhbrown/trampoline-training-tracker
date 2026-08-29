import { createClient } from "@/lib/supabase/server";
import PrintablePlanSheet from "./PrintablePlanSheet";

type PageProps = {
  params: Promise<{ coachId: string }>;
};

export default async function PrintPlansPage({ params }: PageProps) {
  const { coachId } = await params;
  const supabase = await createClient();

  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, level")
    .eq("coach_id", Number(coachId))
    .order("name");

  if (error) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  return (
    <main className="bg-white">
      {await Promise.all(
        (athletes ?? []).map(async (athlete) => {
          const { data: plan } = await supabase
            .from("plans")
            .select("id")
            .eq("athlete_id", athlete.id)
            .maybeSingle();

          const { data: planItems } = plan
            ? await supabase
                .from("plan_items")
                .select("id, name, target")
                .eq("plan_id", plan.id)
                .order("id")
            : { data: [] };

          const { data: routines } = await supabase
            .from("routines")
            .select("compulsory, custom_compulsory, optional_a, optional_a_difficulty, optional_b, optional_b_difficulty, double_mini_set_a, skills, notes")
            .eq("athlete_id", athlete.id)
            .maybeSingle();

          return (
            <PrintablePlanSheet
              key={athlete.id}
              athlete={athlete}
              planItems={planItems ?? []}
              routines={routines}
            />
          );
        })
      )}
    </main>
  );
}
