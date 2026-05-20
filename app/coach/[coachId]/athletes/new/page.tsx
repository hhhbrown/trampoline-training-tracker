import AddAthleteForm from "./AddAthleteForm";

type PageProps = {
    params: Promise<{
        coachId: string;
    }>;
};

export default async function AddAthletePage({ params }: PageProps) {
    const { coachId } = await params;

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach Edit
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Add Athlete
                </h1>

                <AddAthleteForm coachId={coachId} />
            </div>
        </main>
    );
}