import { trpc } from "@/lib/trpc";
import LoadingPage from "../server/LoadingPage";
import { Button } from "../ui/button";
import { Activity, AlertTriangle, Clock, Copy, Eye, EyeOff, Flag, Keyboard, Play, RefreshCw, Settings, Shield, Star, Tag, User } from "lucide-react";
import { useFavouriteServers } from "@/lib/client-storage/favourite-servers";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";
import { PingBars } from "../serverview/ServerRow";
import { useLocationStore } from "@/lib/location/store";
import { EstimatePing } from "@/lib/location/ping";
import { formatDuration } from "@/lib/utils/time";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TRPCError } from "@trpc/server";

export default function ServerPage({ serverid }: { serverid?: string }) {
    const { isFavourite, toggleFavourite } = useFavouriteServers();
    const { isHidden, toggleHidden } = useHiddenServers();
    const location = useLocationStore(state => state.location);

    const [changedState, setChangedState] = useState(0);
    const [ping, setPing] = useState(0);
    const [pageLoadTime] = useState(() => Math.floor(Date.now() / 1000));
    const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));
    const [histogramMode, setHistogramMode] = useState<"1" | "2" | "3">("1");
    const [openReportModal, setOpenReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const { data, isLoading } = trpc.servers.fetchServer.useQuery({ serverId: serverid || "" }, { enabled: !!serverid });
    const reportServerMutation = trpc.tasks.reportServer.useMutation();

    useEffect(() => {
        if (data && location) {
            setPing(EstimatePing(data.Latitute, data.Longitude, location.latitude, location.longitude))
        }
    }, [data, location]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const allPlayersHaveEmptyNames = useMemo(() => {
        // @ts-expect-error
        if (!data?.playersData?.List || data?.playersData?.List.length === 0) return false;
        // @ts-expect-error
        return data.playersData.List.every(player => player.Name === "");
    }, [data]);

    const chartData = useMemo(() => {
        const histogram = histogramMode == "1" ? data?.playersData?.MaxLast24Hours : histogramMode === "2" ? data?.playersData?.MaxLast7Days : data?.playersData?.MaxLast30Days;
        if (!histogram) return [];

        return Object.entries(histogram)
            .map(([timestamp, count]) => ({
                timestamp,
                players: count,
                formattedTime: histogramMode === "1"
                    ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [data?.playersData, histogramMode]);

    const handleReportSubmit = async () => {
        if (!serverid || !reportReason) return;

        setIsSubmittingReport(true);
        try {
            await reportServerMutation.mutateAsync({
                serverId: serverid,
                reason: reportReason,
                details: reportDetails
            });

            toast.success('Report submitted successfully. Thank you for helping us maintain server quality!', {
                icon: <Flag className="h-4 w-4" />,
                duration: 4000,
            });

            setOpenReportModal(false);
            setReportReason("");
            setReportDetails("");
            setIsSubmittingReport(false)
        } catch (error) {
            // @ts-expect-error
            const errorMessage = error.shape.message || 'An unexpected error occurred while submitting your report. Please try again later.';
            toast.error(errorMessage, {
                icon: <AlertTriangle className="h-4 w-4" />,
                duration: 4000,
            });

            setIsSubmittingReport(false);
        }
    };

    if (!serverid || isLoading || !data || !data.serverData) {
        return (
            <div className="w-full">
                <div className="flex flex-row w-full">
                    <div className="flex-1 transition-all duration-300 ease-in-out">
                        <LoadingPage />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row w-full gap-6">
                <div className="bg-gray-900/20 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
                    <div className="p-4 md:p-6 flex flex-col gap-2">

                        {/* Title */}
                        <div className="flex items-start justify-between mb-3 gap-3">
                            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                                <img
                                    src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${data.Country}.svg`}
                                    alt={data.Country}
                                    style={{ width: "1.5em", height: "1.125em" }}
                                    className="rounded shadow-sm mr-3 flex-shrink-0"
                                />
                                <h1 className="text-md lg:text-lg text-white font-medium leading-tight break-words min-w-0">{data.serverData.Hostname}</h1>
                            </div>
                        </div>

                        {/* Server Image */}
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            <div className="flex-shrink-0 w-full">
                                <div className="w-full h-48 md:h-60 bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/30 relative">
                                    <img
                                        src={`/maps/${data.serverData.Map}.webp`}
                                        alt={`${data.serverData.Map} map`}
                                        className="w-full h-full object-cover transition-transform duration-300"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/maps/default.webp';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="text-white font-medium text-lg mb-1">{data.serverData.Map}</div>
                                        <div className="text-gray-300 text-sm">Current Map</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    onClick={() => {
                                        if (data.Address) {
                                            window.open(`steam://connect/${data.Address}`, '_self');
                                        }
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base flex items-center justify-center space-x-2 transition-colors duration-200"
                                >
                                    <Play className="h-4 w-4 lg:h-5 lg:w-5" />
                                    <span>Join Server</span>
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (data.ID) {
                                            const newState = toggleFavourite(data.ID);
                                            toast.success(
                                                newState ? 'Added to favorites!' : 'Removed from favorites!',
                                                {
                                                    icon: <Star className="h-4 w-4" />,
                                                    duration: 2000,
                                                }
                                            );
                                            setChangedState(prev => prev + 1);
                                        }
                                    }}
                                    className={`w-full px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base flex items-center justify-center transition-colors duration-200 ${data?.ID && isFavourite(data.ID)
                                        ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                        : "bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                                        }`}
                                >
                                    <Star className={`h-4 w-4 lg:h-5 lg:w-5 ${data.ID && isFavourite(data.ID) ? "fill-current" : ""}`} />
                                    <span>
                                        {data.ID && isFavourite(data.ID)
                                            ? "Remove from Favorites"
                                            : "Add to Favorites"
                                        }
                                    </span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    onClick={() => {
                                        toggleHidden(data.ID);
                                        toast.success(!isHidden(data.ID) ? 'Server unhidden!' : "Server hidden! You can manage hidden servers in your profile.", {
                                            icon: !isHidden(data.ID) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />,
                                            duration: 2000,
                                        });
                                        setChangedState(prev => prev + 1);
                                    }}
                                    className={`w-full bg-transparent px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base flex items-center justify-center space-x-2 transition-colors duration-200 ${isHidden(data.ID)
                                        ? "border border-green-500 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                        : "border border-gray-500 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300"
                                        }`}
                                >
                                    {changedState > -1 && isHidden(data.ID) ? (
                                        <>
                                            <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                                            <span>Unhide Server</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
                                            <span>Hide Server</span>
                                        </>
                                    )}
                                </Button>

                                <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base flex items-center justify-center space-x-2 transition-colors duration-200"
                                        >
                                            <Flag className="h-4 w-4 lg:h-5 lg:w-5" />
                                            <span>Report Server</span>
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>
                            </div>
                        </div>

                        {/* Server Info */}
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between py-1.5 border-b border-gray-700/30">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><Clock className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Last Updated</span>
                                <span className="text-white font-medium text-xs lg:text-sm">{data.LastUpdated!.toLocaleString("en-GB")}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-gray-700/30">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><User className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Players</span>
                                <span className="text-white font-medium text-xs lg:text-sm">{data.serverData.PlayersCount || 0} / {data.serverData.MaxPlayers || 0} {data.serverData.BotsCount > 0 ? `(${data.serverData.BotsCount} bot${data.serverData.BotsCount > 1 ? 's' : ''})` : ''}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-gray-700/30">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><Keyboard className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Address</span>
                                <span className="text-white font-medium text-xs lg:text-sm items-center flex"><Shield className={`h-4 w-4 lg:h-5 lg:w-5 mr-1 inline ${data.serverData.Secure ? "text-green-400" : "text-red-400"}`} /> {data.Address}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-gray-700/30">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><Settings className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Game Version</span>
                                <span className="text-white font-medium text-xs lg:text-sm">{data.serverData.Version || "Unknown"}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-gray-700/30">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><Activity className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Ping</span>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-end justify-end space-x-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <PingBars ping={ping} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{ping}ms</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col py-1.5">
                                <span className="text-gray-400 text-sm lg:text-md flex items-center gap-1"><Tag className="h-4 w-4 lg:h-5 lg:w-5 mr-1 inline" /> Tags</span>
                                <div className="mt-2">
                                    {data.serverData.Tags && data.serverData.Tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 max-w-md">
                                            {data.serverData.Tags.split(",").map((tag, index) => (
                                                <span key={index} className="inline-block bg-gray-700/50 text-gray-300 text-xs lg:text-sm px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-white font-medium text-xs lg:text-sm">No tags available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-full">
                    {
                        allPlayersHaveEmptyNames && (
                            <div className="bg-amber-900/20 backdrop-blur-sm rounded-lg border border-amber-500/30 overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-amber-400 font-medium text-sm">Player Names Not Available</h4>
                                            <p className="text-white text-xs mt-1">
                                                This server is not providing player names because it{"'"}s not using <a href="https://github.com/Source2ZE/ServerListPlayersFix" className="text-[#00feed] hover:text-[#00feed]/80 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">ServerListPlayersFix</a>. Make sure that the server uses this plugin for the names to appear.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <div className="bg-gray-900/20 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">

                        {/* Mobile */}
                        <div className="block md:hidden p-4">
                            {/* @ts-expect-error */}
                            <h3 className="text-base font-medium text-white mb-3">Players Online ({data.playersData?.List?.length})</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {/* @ts-expect-error */}
                                {data.playersData?.List!.map((player, index) => {
                                    const initialDuration = Math.floor(player.Duration);
                                    const elapsedSinceLoad = currentTime - pageLoadTime;
                                    const currentDuration = initialDuration + elapsedSinceLoad;

                                    return (
                                        <div key={index} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-400 text-xs">#{index + 1}</span>
                                                    <span className="text-white font-medium text-sm truncate">
                                                        {player.Name == "" ? `Player #${index + 1}` : player.Name}
                                                    </span>
                                                </div>
                                                <span className="text-gray-300 text-xs">{player.Score} pts</span>
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                Playing for {formatDuration(currentDuration)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block p-4 lg:p-6">
                            {/* @ts-expect-error */}
                            <h3 className="text-lg font-medium text-white mb-3">Players Online ({data.playersData?.List?.length})</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                                {/* @ts-expect-error */}
                                {data.playersData?.List?.map((player, index) => {
                                    const initialDuration = Math.floor(player.Duration);
                                    const elapsedSinceLoad = currentTime - pageLoadTime;
                                    const currentDuration = initialDuration + elapsedSinceLoad;

                                    return (
                                        <div key={index} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="flex items-center justify-center w-7 h-7 bg-gray-700/50 rounded-full text-gray-400 text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-white font-medium truncate">
                                                            {player.Name == "" ? `Player #${index + 1}` : player.Name}
                                                        </div>
                                                        <div className="text-gray-400 text-xs">
                                                            Playing for {formatDuration(currentDuration)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[#00feed] font-bold text-base">
                                                        {player.Score}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        points
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                                <div className="mb-3 sm:mb-0">
                                    <h3 className="text-base md:text-lg font-medium text-white mb-1 md:mb-2">Player Count History</h3>
                                    <p className="text-gray-400 text-xs md:text-sm">Peak player counts over time</p>
                                </div>
                                <div className="flex bg-gray-800/50 rounded-lg p-1 w-full sm:w-auto">
                                    <button
                                        onClick={() => setHistogramMode("1")}
                                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${histogramMode === "1"
                                            ? "bg-[#00feed] text-black font-medium"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        24 Hours
                                    </button>
                                    <button
                                        onClick={() => setHistogramMode("2")}
                                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${histogramMode === "2"
                                            ? "bg-[#00feed] text-black font-medium"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        7 Days
                                    </button>
                                    <button
                                        onClick={() => setHistogramMode("3")}
                                        className={`flex-1 sm:flex-none px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors ${histogramMode === "3"
                                            ? "bg-[#00feed] text-black font-medium"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        30 Days
                                    </button>
                                </div>
                            </div>

                            {chartData.length > 0 ? (
                                <ChartContainer config={{ players: { label: "Players", color: "#00feed" }, }} className="h-48 md:h-64 w-full">
                                    <AreaChart data={chartData}>
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
                                            domain={[0, data?.serverData.MaxPlayers || 64]}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Area
                                            dataKey="players"
                                            type="monotone"
                                            fill="var(--color-players)"
                                            fillOpacity={0.05}
                                            stroke="var(--color-players)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-2">No data available</div>
                                        <div className="text-gray-500 text-sm">
                                            Player count history will appear here once data is collected
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/40 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="text-white text-lg font-semibold">Server Banners</div>
                    <div className="text-gray-400 text-sm">Embed these banners on your website or forum</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Big Banner */}
                    <div className="space-y-3">
                        <h3 className="text-white font-medium">Large Banner (550x95)</h3>
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 h-32 flex items-center justify-center">
                            <img
                                src={`/api/banners/${serverid}/big`}
                                alt="Large Server Banner"
                                className="max-w-full max-h-full rounded"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Direct Link</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`https://cs2browser.net/banners/${serverid}/big.png`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://cs2browser.net/banners/${serverid}/big.png`);
                                            toast.success('Direct link copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">HTML Code</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`<a href="https://cs2browser.net/server/${serverid}"><img src="https://cs2browser.net/banners/${serverid}/big.png" alt="Server Banner" /></a>`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`<a href="https://cs2browser.net/server/${serverid}"><img src="https://cs2browser.net/banners/${serverid}/big.png" alt="Server Banner" /></a>`);
                                            toast.success('HTML code copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Forum BBCode</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`[url=https://cs2browser.net/server/${serverid}][img]https://cs2browser.net/banners/${serverid}/big.png[/img][/url]`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`[url=https://cs2browser.net/server/${serverid}][img]https://cs2browser.net/banners/${serverid}/big.png[/img][/url]`);
                                            toast.success('BBCode copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small Banner */}
                    <div className="space-y-3">
                        <h3 className="text-white font-medium">Small Banner (350x20)</h3>
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 h-32 flex items-center justify-center">
                            <img
                                src={`/api/banners/${serverid}/small`}
                                alt="Small Server Banner"
                                className="max-w-full max-h-full rounded"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Direct Link</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`https://cs2browser.net/banners/${serverid}/small.png`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://cs2browser.net/banners/${serverid}/small.png`);
                                            toast.success('Direct link copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">HTML Code</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`<a href="https://cs2browser.net/server/${serverid}"><img src="https://cs2browser.net/banners/${serverid}/small.png" alt="Server Banner" /></a>`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`<a href="https://cs2browser.net/server/${serverid}"><img src="https://cs2browser.net/banners/${serverid}/small.png" alt="Server Banner" /></a>`);
                                            toast.success('HTML code copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Forum BBCode</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`[url=https://cs2browser.net/server/${serverid}][img]https://cs2browser.net/banners/${serverid}/small.png[/img][/url]`}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`[url=https://cs2browser.net/server/${serverid}][img]https://cs2browser.net/banners/${serverid}/small.png[/img][/url]`);
                                            toast.success('BBCode copied!');
                                        }}
                                        className="bg-[#00feed] hover:bg-[#00feed]/80 text-black"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
                <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Report Server</DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Help us maintain server quality by reporting issues with this server.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                Reason for reporting *
                            </label>
                            <Select value={reportReason} onValueChange={setReportReason}>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="fake" className="text-white hover:bg-gray-700">
                                        Fake/Invalid Server
                                    </SelectItem>
                                    <SelectItem value="inappropriate" className="text-white hover:bg-gray-700">
                                        Inappropriate Content
                                    </SelectItem>
                                    <SelectItem value="broken" className="text-white hover:bg-gray-700">
                                        Broken/Non-functional
                                    </SelectItem>
                                    <SelectItem value="other" className="text-white hover:bg-gray-700">
                                        Other
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                Additional details (optional)
                            </label>
                            <Textarea
                                placeholder="Describe the issue in more detail..."
                                value={reportDetails}
                                onChange={(e) => setReportDetails(e.target.value)}
                                maxLength={500}
                                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[80px] resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {reportDetails.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenReportModal(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReportSubmit}
                            disabled={!reportReason || isSubmittingReport}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSubmittingReport ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Flag className="h-4 w-4 mr-2" />
                                    Submit Report
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}