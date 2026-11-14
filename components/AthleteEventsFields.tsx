"use client";

import { useState } from "react";
import { DMT_LEVELS, SYN_LEVELS, competesInEvent, type AthleteEvents } from "@/lib/athlete-events";

export type ExternalPartnerOption = { id: number; name: string; club: string | null };
export type PartnerOption = { id: number; name: string };

export default function AthleteEventsFields({ value, onChange, athletes, athleteId, partnersError, externalPartnerAvailable, externalAthletes, externalPartnersError }: {
    value: AthleteEvents;
    onChange: (value: AthleteEvents) => void;
    athletes: PartnerOption[];
    athleteId?: number;
    partnersError?: string;
    externalPartnerAvailable: boolean;
    externalAthletes: ExternalPartnerOption[];
    externalPartnersError?: string;
}) {
    const [search, setSearch] = useState("");
    const [externalSearch, setExternalSearch] = useState("");
    const style = "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-500";
    const club = athletes.filter((athlete) => athlete.id !== athleteId);
    const matches = club.filter((athlete) => athlete.name.toLowerCase().includes(search.trim().toLowerCase()) || String(athlete.id) === value.partnerId);
    const currentMissing = value.partnerId && !club.some((athlete) => String(athlete.id) === value.partnerId);
    return (
        <div className="space-y-3">
            {([['dmtLevel', 'DMT', DMT_LEVELS], ['synLevel', 'SYN', SYN_LEVELS]] as const).map(([key, title, levels]) => (
                <details key={key} className="overflow-hidden rounded-xl border border-red-100">
                    <summary className="cursor-pointer bg-red-50 px-4 py-3 text-sm font-bold text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700">
                        {title} <span className="ml-2 font-normal text-zinc-600">{competesInEvent(value[key]) ? value[key] : "Doesn’t compete"}</span>
                    </summary>
                    <div className="space-y-4 p-4">
                        <div>
                            <label htmlFor={`athlete-${key}`} className="mb-1 block text-sm font-medium text-zinc-700">{title} level</label>
                            <select id={`athlete-${key}`} value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value, ...(key === 'synLevel' && !event.target.value ? { partnerType: 'none', partnerId: '', externalPartnerId: '', externalName: '', externalClub: '' } : {}) })} className={style}>
                                <option value="">Doesn’t compete in this event</option>
                                {value[key] && !levels.some((level) => level === value[key]) && <option value={value[key]}>{value[key]} (current value)</option>}
                                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                        {key === 'synLevel' && competesInEvent(value.synLevel) && (
                            <>
                                <div>
                                    <label htmlFor="syn-partner-type" className="mb-1 block text-sm font-medium text-zinc-700">Synchro partner</label>
                                    <select id="syn-partner-type" value={value.partnerType} onChange={(event) => onChange({ ...value, partnerType: event.target.value as AthleteEvents['partnerType'] })} className={style}>
                                        <option value="none">Not assigned yet</option>
                                        <option value="club">Athlete from our club</option>
                                        <option value="external" disabled={!externalPartnerAvailable}>External partner</option>
                                    </select>
                                </div>
                                {value.partnerType === 'club' && (
                                    <div className="space-y-2">
                                        <label htmlFor="syn-partner-search" className="block text-sm font-medium text-zinc-700">Search club athletes</label>
                                        <input id="syn-partner-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={style} placeholder="Search by name" />
                                        <label htmlFor="syn-partner-athlete" className="sr-only">Select club partner</label>
                                        <select id="syn-partner-athlete" value={value.partnerId} onChange={(event) => onChange({ ...value, partnerId: event.target.value })} className={style}>
                                            <option value="">Select partner</option>
                                            {currentMissing && <option value={value.partnerId}>Current partner (athlete #{value.partnerId})</option>}
                                            {matches.map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.name}</option>)}
                                        </select>
                                        {!matches.length && <p className="text-sm text-zinc-600">No matching club athletes.</p>}
                                        {partnersError && <p role="alert" className="text-sm text-amber-900">{partnersError}</p>}
                                    </div>
                                )}
                                {value.partnerType === 'external' && (
                                    <div className="space-y-3">
                                        <label htmlFor="syn-external-search" className="block text-sm font-medium text-zinc-700">Search external athletes</label>
                                        <input id="syn-external-search" type="search" value={externalSearch} onChange={(event) => setExternalSearch(event.target.value)} className={style} placeholder="Search name or club" />
                                        <label htmlFor="syn-external-partner" className="sr-only">Select external partner</label>
                                        <select id="syn-external-partner" value={value.externalPartnerId} onChange={(event) => onChange({ ...value, externalPartnerId: event.target.value })} className={style}>
                                            <option value="">Select external partner</option>
                                            {value.externalPartnerId && value.externalPartnerId !== 'new' && !externalAthletes.some((athlete) => String(athlete.id) === value.externalPartnerId) && <option value={value.externalPartnerId}>Current external partner (#{value.externalPartnerId})</option>}
                                            {externalAthletes.filter((athlete) => `${athlete.name} ${athlete.club ?? ''}`.toLowerCase().includes(externalSearch.trim().toLowerCase()) || String(athlete.id) === value.externalPartnerId).map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.name}{athlete.club ? ` · ${athlete.club}` : ''}</option>)}
                                            <option value="new">+ Add external athlete</option>
                                        </select>
                                        {externalPartnersError && <p role="alert" className="text-sm text-amber-900">{externalPartnersError}</p>}
                                        {value.externalPartnerId === 'new' && <>
                                            <div><label htmlFor="external-athlete-name" className="mb-1 block text-sm font-medium text-zinc-700">Name</label><input id="external-athlete-name" value={value.externalName} onChange={(event) => onChange({ ...value, externalName: event.target.value })} className={style} /></div>
                                            <div><label htmlFor="external-athlete-club" className="mb-1 block text-sm font-medium text-zinc-700">Club (optional)</label><input id="external-athlete-club" value={value.externalClub} onChange={(event) => onChange({ ...value, externalClub: event.target.value })} className={style} /></div>
                                        </>}
                                    </div>
                                )}
                                {!externalPartnerAvailable && <p className="text-sm text-amber-900">External partner access is unavailable. Reload and check the database column and permissions.</p>}
                            </>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );
}
