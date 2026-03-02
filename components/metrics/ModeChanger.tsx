export default function ModeChanger({ mode, setMode }: { mode: '24h' | '7d' | '30d', setMode: (mode: '24h' | '7d' | '30d') => void }) {
    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col">
                <div className="mb-3 sm:mb-0">
                    <h3 className="text-base md:text-lg font-medium text-white mb-1 md:mb-2">Server Metrics History</h3>
                    <p className="text-gray-400 text-xs md:text-sm">Monitor server processing metrics over time</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg w-full grid grid-cols-3 mt-4">
                    <button
                        onClick={() => setMode("24h")}
                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${mode === "24h"
                            ? "bg-[#00feed] text-black font-medium"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        24 Hours
                    </button>
                    <button
                        onClick={() => setMode("7d")}
                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${mode === "7d"
                            ? "bg-[#00feed] text-black font-medium"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setMode("30d")}
                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${mode === "30d"
                            ? "bg-[#00feed] text-black font-medium"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        30 Days
                    </button>
                </div>
            </div>
        </div>
    )
}