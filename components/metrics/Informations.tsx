import Legend from "./Legend";
import ModeChanger from "./ModeChanger";

export default function Informations({ data, currentStats, mode, setMode }: { data: any, currentStats: { checked: number, prefilter: number, players: number }, mode: '24h' | '7d' | '30d', setMode: (mode: '24h' | '7d' | '30d') => void }) {
    return (
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
            <div className="p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl text-white font-semibold mb-2">Metrics Dashboard</h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Real-time metrics showing server checking performance and prefilter statistics
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-xl p-4 border border-gray-700/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Steam API Filtered Servers</div>
                                <div className="text-2xl font-semibold text-[#ff6b6b]">
                                    {currentStats.prefilter.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-3 h-3 bg-[#ff6b6b] rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-xl p-4 border border-gray-700/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Filtered Servers</div>
                                <div className="text-2xl font-semibold text-[#00feed]">
                                    {data ? data.filteredServers.toLocaleString() : currentStats.checked.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-3 h-3 bg-[#00feed] rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-xl p-4 border border-gray-700/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Total Players</div>
                                <div className="text-2xl font-semibold text-[#22c55e]">
                                    {currentStats.players.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-3 h-3 bg-[#22c55e] rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <ModeChanger mode={mode} setMode={(mode) => setMode(mode)} />

            <Legend />
        </div>
    )
}