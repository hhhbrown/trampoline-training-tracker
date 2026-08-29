import { compulsorySkills } from "@/lib/compulsories";

type Athlete = {
    id: number;
    name: string;
    level: string | null;
};

type PlanItem = {
    id: number;
    name: string | null;
    target: number | null;
};

type Routines = {
    compulsory: string | null;
    custom_compulsory: string | null;
    optional_a: string | null;
    optional_a_difficulty: number | null;
    optional_b: string | null;
    optional_b_difficulty: number | null;
    double_mini_set_a: string | null;
    notes: string | null;
} | null;

export default function PrintablePlanSheet({
    athlete,
    planItems,
    routines,
}: {
    athlete: Athlete;
    planItems: PlanItem[];
    routines: Routines;
}) {
    const today = new Date().toLocaleDateString("en-CA");
    const rows = Array.from({ length: 15 }, (_, index) => planItems[index]);

    const compulsory =
        routines?.compulsory === "Level 5+"
            ? splitRoutine(routines.custom_compulsory)
            : compulsorySkills[routines?.compulsory ?? ""] ?? [];
    const optionalA = splitRoutine(routines?.optional_a);
    const optionalB = splitRoutine(routines?.optional_b);
    const doubleMiniSetA = splitRoutine(routines?.double_mini_set_a);

    return (
        <section className="mx-auto mb-4 w-[7.75in] min-h-[10in] bg-white p-2 text-black print:mb-0 print:break-after-page">
            <div className="mb-1 flex justify-center gap-20 text-xs">
                <span>Name: {athlete.name}</span>
                <span>Date: {today}</span>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr>
                        <th className="h-4 w-20 border border-black bg-zinc-200 p-1 text-left">
                            {athlete.level}
                        </th>
                        <th className="border border-black bg-yellow-300 p-1 text-left">
                            Compulsory
                        </th>
                        <th className="border border-black bg-yellow-300 p-1 text-left">
                            Optional A
                            <span className="block font-normal">
                                DD: {routines?.optional_a_difficulty ?? ""}
                            </span>
                        </th>
                        <th className="border border-black bg-yellow-300 p-1 text-left">
                            Optional B
                            <span className="block font-normal">
                                DD: {routines?.optional_b_difficulty ?? ""}
                            </span>
                        </th>
                        <th className="border border-black bg-yellow-300 p-1"></th>
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index}>
                            <td className="border border-black bg-zinc-100 p-1 text-center">
                                {index + 1}
                            </td>
                            <td className="border border-black p-1">
                                {compulsory[index] ?? ""}
                            </td>
                            <td className="border border-black p-1">
                                {optionalA[index] ?? ""}
                            </td>
                            <td className="border border-black p-1">
                                {optionalB[index] ?? ""}
                            </td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    ))}

                    <tr>
                        <td
                            colSpan={3}
                            className="border border-black bg-yellow-300 p-1 text-center font-semibold"
                        >
                            DMT
                        </td>
                        <td
                            colSpan={2}
                            rowSpan={5}
                            className="border border-black p-1 align-top"
                        >
                            <p className="font-semibold">Skills to work on:</p>
                        </td>
                    </tr>

                    {Array.from({ length: 4 }).map((_, index) => (
                        <tr key={`dmt-${index}`}>
                            <td className="border border-black bg-zinc-100 p-1 text-center">
                                {index + 1}
                            </td>
                            <td colSpan={2} className="border border-black p-1">
                                {doubleMiniSetA[index] ?? ""}
                            </td>
                        </tr>
                    ))}

                    <tr>
                        <td colSpan={5} className="h-6 border border-black bg-red-700"></td>
                    </tr>

                    <tr>
                        <td className="border border-black p-1 text-center">Date</td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                    </tr>

                    {rows.map((item, index) => (
                        <tr
                            key={index}
                            className={
                                index < 8
                                    ? "bg-red-100"
                                    : index < 12
                                        ? "bg-yellow-100"
                                        : "bg-zinc-200"
                            }
                        >
                            <td className="border border-black p-1 text-center">
                                {index + 1}
                            </td>
                            <td className="border border-black p-1">
                                {item?.name ?? ""}
                            </td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

function splitRoutine(value: string | null | undefined) {
    return (value ?? "")
        .split("\n")
        .map((skill) => skill.trim())
        .filter(Boolean);
}
