export default function Legend() {
    return (
        <div className="p-4 md:p-6">
            <h3 className="text-base font-medium text-white mb-3">Metrics Explanation</h3>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-[#ff6b6b] rounded-full mt-0.5 flex-shrink-0"></div>
                    <div>
                        <div className="text-white font-medium text-sm">Steam API Filtered Servers</div>
                        <div className="text-gray-400 text-xs">
                            Number of servers in the prefilter stage before full validation
                        </div>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-[#00feed] rounded-full mt-0.5 flex-shrink-0"></div>
                    <div>
                        <div className="text-white font-medium text-sm">Filtered Servers</div>
                        <div className="text-gray-400 text-xs">
                            Number of servers that have been filtered by our systems
                        </div>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-[#22c55e] rounded-full mt-0.5 flex-shrink-0"></div>
                    <div>
                        <div className="text-white font-medium text-sm">Total Players</div>
                        <div className="text-gray-400 text-xs">
                            Total number of players across all active CS2 servers
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}