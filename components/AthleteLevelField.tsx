"use client";

import { isCombinedNoviceLevel } from "@/lib/competition-age";

export default function AthleteLevelField({ value, onChange, levels, error }: {
    value: string;
    onChange: (value: string) => void;
    levels: string[];
    error?: string;
}) {
    const options = [...new Set(levels)].filter((name) => !isCombinedNoviceLevel(name));
    const legacyValue = value !== "" && !options.includes(value);

    return (
        <div>
            <label htmlFor="athlete-tri-level" className="mb-1 block text-sm font-semibold text-black">TRI level</label>
            <select
                id="athlete-tri-level"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-base text-black outline-none focus:ring-2 focus:border-red-700 focus:ring-red-700"
            >
                <option value="">Select TRI level</option>
                {legacyValue && <option value={value}>{value} (current value)</option>}
                {options.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            {isCombinedNoviceLevel(value) && <p className="mt-2 text-sm text-red-800">Choose Novice (ages 11–14) or Level 5 (age 15+). The existing value is preserved until you change it.</p>}
            {error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}
        </div>
    );
}
