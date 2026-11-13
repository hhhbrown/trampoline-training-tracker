"use client";

export default function AthleteLevelField({ value, onChange, levels, error }: {
    value: string;
    onChange: (value: string) => void;
    levels: string[];
    error?: string;
}) {
    const options = [...new Set(levels)];
    const legacyValue = value !== "" && !options.includes(value);

    return (
        <div>
            <label htmlFor="athlete-tri-level" className="mb-1 block text-sm font-medium text-zinc-700">TRI level</label>
            <select
                id="athlete-tri-level"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none focus:ring-2 focus:ring-red-500"
            >
                <option value="">Select TRI level</option>
                {legacyValue && <option value={value}>{value} (current value)</option>}
                {options.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            {error && <p role="alert" className="mt-2 text-sm text-amber-900">{error}</p>}
        </div>
    );
}
