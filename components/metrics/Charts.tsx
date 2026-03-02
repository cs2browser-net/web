import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export interface ChartData {
    timestamp: string;
    prefilter?: number;
    prefilterDiff?: number;
    checked?: number;
    players?: number;
    formattedTime: string;
}

export interface ChartsInterface {
    serversChartData: ChartData[];
    playersChartData: ChartData[];
}

export default function Charts({ serversChartData, playersChartData }: ChartsInterface) {
    return (
        <>
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-base md:text-lg font-medium text-white">Filtering Metrics</h3>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-[#ff6b6b] rounded-full"></div>
                                <p className="text-gray-400 text-xs md:text-sm">Steam API Filtered Servers</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-[#00feed] rounded-full"></div>
                                <p className="text-gray-400 text-xs md:text-sm">Filtered Servers</p>
                            </div>
                        </div>
                    </div>

                    {serversChartData.length > 0 ? (
                        <ChartContainer
                            config={{
                                prefilterDiff: { label: "Steam API Filtered", color: "#ff6b6b" },
                                prefilter: { label: "Steam API Filtered", color: "#ff6b6b" },
                                checked: { label: "Filtered Servers", color: "#00feed" }
                            }}
                            className="h-48 md:h-64 w-full"
                        >
                            <AreaChart data={serversChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="formattedTime"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Area
                                    dataKey="prefilterDiff"
                                    type="monotone"
                                    fill="var(--color-prefilter)"
                                    fillOpacity={0.2}
                                    stroke="var(--color-prefilter)"
                                    strokeWidth={2}
                                    stackId="1"
                                />
                                <Area
                                    dataKey="checked"
                                    type="monotone"
                                    fill="var(--color-checked)"
                                    fillOpacity={0.2}
                                    stroke="var(--color-checked)"
                                    strokeWidth={2}
                                    stackId="2"
                                />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-400 mb-2">No server data available</div>
                                <div className="text-gray-500 text-sm">
                                    Server metrics will appear here once collected
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-4 h-4 bg-[#22c55e] rounded-full"></div>
                            <h3 className="text-base md:text-lg font-medium text-white">Total Player Count</h3>
                        </div>
                        <p className="text-gray-400 text-xs md:text-sm">Total number of players across all CS2 servers</p>
                    </div>

                    {playersChartData.length > 0 ? (
                        <ChartContainer config={{ players: { label: "Total Players", color: "#22c55e" } }} className="h-48 md:h-64 w-full">
                            <AreaChart data={playersChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="formattedTime"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Area
                                    dataKey="players"
                                    type="monotone"
                                    fill="var(--color-players)"
                                    fillOpacity={0.2}
                                    stroke="var(--color-players)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-400 mb-2">No player data available</div>
                                <div className="text-gray-500 text-sm">
                                    Player count metrics will appear here once collected
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}