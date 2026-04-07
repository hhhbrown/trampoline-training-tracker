export default function AthletePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Athlete Profile
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">Name</h1>
                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        Level 2
                    </div>
                </div>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-black">Routines</h2>
                    <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold text-black">Compulsory</h3>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                <li>Back Layout</li>
                                <li>Back Tuck</li>
                                <li>Tuck Barani</li>
                                <li>Tuck Jump</li>
                                <li>Pike Barani</li>
                                <li>Back Pike</li>
                                <li>Seat Drop</li>
                                <li>Swivel Hips</li>
                                <li>Half Twist to Feet</li>
                                <li>Pike Jump</li>
                                <li>Layout Barani</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold text-black">Optional A</h3>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                <li>Layout Barani</li>
                                <li>Back Layout</li>
                                <li>Back Full</li>
                                <li>Pike Jump</li>
                                <li>Back Pike</li>
                                <li>Pike Barani</li>
                                <li>Tuck Jump</li>
                                <li>Tuck Barani</li>
                                <li>Back Tuck</li>
                                <li>Rudi</li>
                            </ul>
                        </div>


                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold text-black">Optional B</h3>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                <li>Layout Barani</li>
                                <li>Back Layout</li>
                                <li>Back Full</li>
                                <li>Pike Jump</li>
                                <li>Back Pike</li>
                                <li>Pike Barani</li>
                                <li>Tuck Jump</li>
                                <li>Tuck Barani</li>
                                <li>Back Tuck</li>
                                <li>Rudi</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold text-black">Passes</h3>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                <li>Layout Barani + Back Layout</li>
                                <li>Tuck Barani + Back Tuck</li>
                                <li>Pike Barani + Back Pike</li>
                                <li>Tuck Jump + Rudi</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold text-black">Current Skills</h3>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                <li>Extended Front 3/4</li>
                                <li>Ball Out</li>
                                <li>Cody Timer</li>
                                <li>Back Tuck to Back</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}