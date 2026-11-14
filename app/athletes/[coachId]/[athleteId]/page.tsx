import AthleteEventSummary from "@/components/AthleteEventSummary";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{
        coachId: string;
        athleteId: string;
    }>;
};

export default async function AthleteDashboardPage({ params }: PageProps) {
    const { coachId, athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", Number(athleteId))
        .single();

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    const athletePath = `/athletes/${coachId}/${athleteId}`;
    const resources = [
        {
            title: "Current Routines",
            description: "Review your compulsory and optional routines.",
            href: `${athletePath}/routines`,
            icon: "routines" as const,
        },
        {
            title: "Dashboard",
            description: "See completed routines, dd records, and 10-bounce times.",
            href: `${athletePath}/progress`,
            icon: "progress" as const,
        },
        {
            title: "Daily Conditioning",
            description: "Find your conditioning exercises for each day of the week.",
            href: `/athletes/${coachId}/conditioning`,
            icon: "conditioning" as const,
        },
        {
            title: "Daily Drills",
            description: "Your drills for each day of the week.",
            href: `/athletes/${coachId}/daily-drills`,
            icon: "routines" as const,
        },
    ];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-6 pt-24 text-zinc-950 sm:px-6 sm:pb-10">
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-thin-chubby/css/uicons-thin-chubby.css"
                precedence="default"
            />
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-thin-straight/css/uicons-thin-straight.css"
                precedence="default"
            />
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css"
                precedence="default"
            />
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-regular-straight/css/uicons-regular-straight.css"
                precedence="default"
            />
            <div className="mx-auto max-w-4xl">
                <BackLink
                    href={`/athletes/${coachId}`}
                >
                    All athletes
                </BackLink>

                <header className="mb-8 mt-6 border-b border-zinc-200 pb-8 sm:mt-8">
                    <p className="text-sm font-semibold uppercase tracking-widest text-red-700">
                        Athlete dashboard
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <h1 className="min-w-0 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                            {athlete.name}
                        </h1>
                        {athlete.level && (
                            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
                                {athlete.level}
                            </span>
                        )}
                    </div>
                    <AthleteEventSummary athlete={athlete} />
                </header>

                <section aria-labelledby="training-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                        <i aria-hidden="true" className="fi fi-tc-paper-plane-launch inline-flex text-xl" />
                        Start Here
                    </div>
                    <h2 id="training-heading" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                        Ready to jump?
                    </h2>
                    <Link
                        href={`${athletePath}/plan`}
                        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-4 rounded-xl bg-red-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-4 sm:w-auto"
                    >
                        Daily Plan
                        <span aria-hidden="true">→</span>
                    </Link>
                </section>

                <nav aria-labelledby="resources-heading" className="mt-10">
                    <h2 id="resources-heading" className="text-xl font-bold tracking-tight">
                        Training Toolkit
                    </h2>
                    <ul className="mt-5 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        {resources.map((resource) => (
                            <li key={resource.href}>
                                <Link
                                    href={resource.href}
                                    className="group flex items-center gap-4 p-5 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 sm:gap-5 sm:p-6"
                                >
                                    <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 sm:flex">
                                        <DashboardIcon kind={resource.icon} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-semibold group-hover:text-red-800">
                                            {resource.title}
                                        </h3>
                                        <p className="mt-1 text-base leading-6 text-zinc-600">
                                            {resource.description}
                                        </p>
                                    </div>
                                    <span aria-hidden="true" className="shrink-0 text-xl text-zinc-400 group-hover:text-red-700">→</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </main>
    );
}

function DashboardIcon({ kind }: { kind: "routines" | "progress" | "conditioning" }) {
    if (kind === "routines") {
        return <i aria-hidden="true" className="fi fi-ts-yoga-moon inline-flex text-xl" />;
    }

    if (kind === "conditioning") {
        return <i aria-hidden="true" className="fi fi-rs-dumbbell-horizontal inline-flex text-xl" />;
    }

    return <i aria-hidden="true" className="fi fi-br-progress-complete inline-flex text-xl" />;
}
