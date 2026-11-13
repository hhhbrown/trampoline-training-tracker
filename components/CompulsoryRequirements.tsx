import { checkCompulsory } from "@/lib/competition-compulsory";

export default function CompulsoryRequirements({ compulsory, routine, error }: {
    compulsory: string | null | undefined;
    routine: string | null | undefined;
    error?: string;
}) {
    const issue = error ?? (compulsory !== "Level 5+"
        ? "Select a Level 5+ compulsory in Edit Routines to check these requirements."
        : !routine?.trim() ? "Add the custom compulsory routine in Edit Routines to check these requirements." : null);
    const checks = issue ? [] : checkCompulsory(routine ?? "");
    const failedCount = checks.filter((check) => !check.passed).length;
    const summary = issue
        ? error ? "Unable to check requirements" : "Routine required"
        : failedCount === 0 ? "All requirements met"
        : `${failedCount} ${failedCount === 1 ? "requirement" : "requirements"} not met`;
    const summaryStyle = issue ? "border-amber-200 bg-amber-50 text-amber-900"
        : failedCount ? "border-red-200 bg-red-50 text-red-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";
    return (
        <section aria-labelledby="compulsory-requirements-heading" className="mt-7">
            <h3 id="compulsory-requirements-heading" className="mb-3 text-lg font-bold text-zinc-950">Compulsory requirements</h3>
            <details open={Boolean(issue) || failedCount > 0} className={`overflow-hidden rounded-xl border ${summaryStyle}`}>
                <summary className="cursor-pointer px-4 py-4 text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700">
                    {summary}
                    <span className="ml-2 text-sm font-medium">(Details)</span>
                </summary>
                {issue ? <p className="px-4 pb-4 text-sm font-semibold">{issue}</p> : (
                <ul className="space-y-3 bg-white p-3 sm:p-4">
                    {checks.map((check) => (
                        <li key={check.id} className={`flex items-start gap-3 rounded-xl border p-4 ${check.passed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
                            <span aria-hidden="true" className="mt-0.5 text-xl font-bold">{check.passed ? "✓" : "✕"}</span>
                            <div>
                                <p className="text-base font-bold">{check.title}</p>
                                <span className="sr-only">{check.passed ? "Requirement met. " : "Requirement not met. "}</span>
                                {check.id !== "separate" && !((check.id === "count" || check.id === "unique" || check.id === "somersaults") && check.passed) && <p className="mt-1 break-words text-sm">{check.detail}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
                )}
            </details>
        </section>
    );
}
