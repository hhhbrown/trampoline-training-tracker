import { createClient } from "@/lib/supabase/server";
import AddAthleteForm from "./AddAthleteForm";

export default async function AddAthletePage() {
    const supabase = await createClient();

    const { data: coaches } = await supabase
        .from("coaches")
        .select("id, name")
        .order("id");

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach Edit
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">Add Athlete</h1>

                <AddAthleteForm coaches={coaches ?? []} />
            </div>
        </main>
    );
}