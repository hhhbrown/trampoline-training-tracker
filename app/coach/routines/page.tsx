'use client';

export default function EditRoutinesPage() {
    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-3xl">

                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Coach View
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">Edit Routines</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Update this athlete’s routines. One skill per line.
                    </p>
                </div>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-black">Routines</h2>
                        <button
                            type="button"
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition"
                        >
                            Save
                        </button>
                    </div>

                    <div className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Compulsory
                            </label>
                            <textarea
                                defaultValue={`Back Layout
                                Back Tuck
                                Tuck Barani
                                Tuck Jump`}
                                rows={5}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Optional A
                            </label>
                            <textarea
                                defaultValue={`Layout Barani
                                Back Full
                                Rudi`}
                                rows={5}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Optional B
                            </label>
                            <textarea
                                defaultValue={`Layout Barani
                                Back Full
                                Rudi`}
                                rows={5}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Passes
                            </label>
                            <textarea
                                defaultValue={`Layout Barani + Back Layout
                                Tuck Barani + Back Tuck`}
                                rows={4}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Current Skills
                            </label>
                            <textarea
                                defaultValue={`Ball Out
                                Cody Timer`}
                                rows={4}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}