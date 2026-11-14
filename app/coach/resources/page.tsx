import BackLink from "@/components/BackLink";
import { coachResources } from "@/lib/coach-resources";

export default function CoachResourcesPage() {
    const categories = [...new Set(coachResources.map((resource) => resource.category))];

    return (
        <main
            className="min-h-screen bg-[#f5efe9] px-4 pb-10 pt-24 text-zinc-950 sm:px-6"
            style={{
                colorScheme: "light",
                backgroundColor: "#f5efe9",
                backgroundImage: "radial-gradient(ellipse at 0% 0%, #eecdc5 0%, transparent 55%), radial-gradient(ellipse at 100% 85%, #e7d5c5 0%, transparent 50%)",
            }}
        >
            <BackLink href="/coach">Back</BackLink>
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 border-b-4 border-red-700 pb-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Coaches</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Resources</h1>
                </header>

                {coachResources.length === 0 ? (
                    <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
                        <h2 className="rounded-t-2xl border-b border-red-100 bg-red-50 px-5 py-4 text-xl font-bold text-red-900">Competition documents</h2>
                        <p className="px-5 py-6 text-base leading-7 text-zinc-600">No resources added yet.</p>
                    </section>
                ) : (
                    <div className="space-y-7">
                        {categories.map((category) => (
                            <section key={category} className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                                <h2 className="border-b border-red-100 bg-red-50 px-5 py-4 text-xl font-bold text-red-900">{category}</h2>
                                <ul className="divide-y divide-zinc-100">
                                    {coachResources.filter((resource) => resource.category === category).map((resource) => (
                                        <li key={resource.url}>
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 px-5 py-4 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700">
                                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 shrink-0 text-red-700"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6" /></svg>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="break-words text-base font-bold text-zinc-950 group-hover:text-red-800">{resource.title}</h3>
                                                    {resource.description && <p className="mt-1 text-sm leading-6 text-zinc-600">{resource.description}</p>}
                                                </div>
                                                <span aria-hidden="true" className="text-xl text-red-700">↗</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
