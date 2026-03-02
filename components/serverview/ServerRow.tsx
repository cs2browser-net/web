"use client";

import { Copy, EyeOff, Play, Star } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Server } from "@/generated/prisma/browser";
import { ServerData } from "@/generated/prisma/client";
import { useMemo, useState } from "react";
import { EstimatePing } from "@/lib/location/ping";
import { useLocationStore } from "@/lib/location/store";
import { toast } from "sonner";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";
import { useFavouriteServers } from "@/lib/client-storage/favourite-servers";
import ServerRowMobile from "./ServerRowMobile";

export interface ServerRowProps {
    isEven: boolean;
    server: ServerData & { server: Server };
}

export function PingBars({ ping }: { ping: number }) {
    let bars = 0;
    let color = '';

    if (ping <= 50) {
        bars = 5;
        color = 'bg-green-500';
    } else if (ping <= 90) {
        bars = 4;
        color = 'bg-green-400';
    } else if (ping <= 130) {
        bars = 3;
        color = 'bg-yellow-500';
    } else if (ping <= 250) {
        bars = 2;
        color = 'bg-orange-500';
    } else {
        bars = 1;
        color = 'bg-red-500';
    }

    return (
        <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((bar) => (
                <div
                    key={bar}
                    className={`w-1 rounded-t-sm transition-all duration-200 ${bar <= bars ? color : 'bg-gray-700/40'
                        }`}
                    style={{ height: `${(bar / 5) * 100}%` }}
                />
            ))}
        </div>
    );
}

export default function ServerRow({ isEven, server }: ServerRowProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    const location = useLocationStore(state => state.location);
    const hiddenServers = useHiddenServers();
    const favouriteServers = useFavouriteServers();

    const ping = useMemo(() => EstimatePing(server.server.Latitute, server.server.Longitude, location?.latitude, location?.longitude), [server, location]);

    const handleCopyIP = (e: React.MouseEvent) => {
        navigator.clipboard.writeText(`connect ${server.server.Address}`);
        toast.success('Copy Address', {
            description: 'IP address copied to clipboard!',
            icon: <Copy className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleConnect = (e: React.MouseEvent) => {
        const steamConnectUrl = `steam://connect/${server.server.Address}`;
        window.location.href = steamConnectUrl;
        toast.success('Connecting to server...', {
            icon: <Play className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleHideServer = (e: React.MouseEvent) => {
        hiddenServers.toggleHidden(server.ServerID);
        toast.success('Server hidden! Refresh to see changes.', {
            icon: <EyeOff className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        const newState = favouriteServers.toggleFavourite(server.ServerID);
        toast.success(
            newState ? 'Added to favorites!' : 'Removed from favorites!',
            {
                icon: <Star className="h-4 w-4" />,
                duration: 2000,
            }
        );
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <div className="md:hidden">
                <ServerRowMobile server={server} isEven={isEven} />
            </div>

            <div
                className={`
                hidden md:grid grid-cols-[3fr_1fr_1.3fr_0.2fr_1.2fr_0.6fr] gap-1 items-center cursor-pointer min-h-[3rem] py-2 group
                hover:bg-[#00feed]/8 border-l-4 border-l-transparent hover:border-l-[#00feed] transition-all duration-200
                ${isEven ? 'bg-gray-800/30' : 'bg-gray-800/20'} rounded-md
                border-b border-gray-800/30 hover:border-gray-700/50 pl-10 pr-4
            `}
            >
                <div className="flex items-center min-w-0 py-1 w-full">
                    <div className="flex-shrink-0 mr-4 flex items-center">
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-1 rounded hover:bg-gray-700/50 transition-colors mr-2 ${favouriteServers.isFavourite(server.ServerID) ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                            title={favouriteServers.isFavourite(server.ServerID) ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star className={`h-4 w-4 ${favouriteServers.isFavourite(server.ServerID) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleHideServer}
                            className="p-1 rounded hover:bg-gray-700/50 transition-colors mr-2 text-gray-500 hover:text-red-500"
                            title={hiddenServers.isHidden(server.ServerID) ? "Unhide server" : "Hide server"}
                        >
                            <EyeOff className="h-4 w-4" />
                        </button>
                        <img src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${server.server.Country}.svg`} alt={server.server.Country} style={{ width: "1.5em", height: "1.25em" }} />
                    </div>
                    <Link href={`/server/${server.ServerID}`} prefetch={"auto"} className="min-w-0 flex-1">
                        <div className="text-white text-sm xl:text-base leading-tight group-hover:text-[#00feed] transition-colors hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {server.Hostname}
                        </div>
                    </Link>
                </div>

                <div className="text-center py-1 w-full">
                    <div className="text-white text-sm xl:text-base font-mono leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {server.PlayersCount} / {server.MaxPlayers}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {server.BotsCount > 0 ? `(${server.BotsCount} bot${server.BotsCount > 1 ? 's' : ''})` : ''}
                    </div>
                </div>

                <div className="text-center py-1 w-full">
                    <button
                        className="text-white text-xs xl:text-sm font-mono hover:text-[#00feed] hover:bg-gray-800/40 px-1 xl:px-2 py-1.5 rounded transition-colors duration-200 group/button leading-tight hyphens-auto flex items-center justify-center mx-auto"
                        title="Click to copy IP"
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        onClick={handleCopyIP}
                    >
                        <span className="mr-1">{server.server.Address}</span>
                        <Copy className="h-3 w-3 opacity-0 group-hover/button:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="text-center py-1 w-full">
                    <button
                        className="text-white text-xs bg-green-500 hover:bg-green-600 p-1.5 rounded transition-colors duration-200 flex items-center justify-center mx-auto"
                        title="Connect to server via Steam"
                        onClick={handleConnect}
                    >
                        <Play className="h-4 w-4" />
                    </button>
                </div>

                <div className="text-center py-1 w-full">
                    <div
                        className="relative overflow-hidden rounded px-2 xl:px-4 py-2 bg-cover bg-center bg-no-repeat min-h-[2rem] w-full flex items-center justify-center"
                    >
                        <span className="relative z-10 text-white text-xs xl:text-sm font-medium leading-tight hyphens-auto text-center" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {server.Map}
                        </span>
                    </div>
                </div>

                <div className="text-center py-1 w-full">
                    <div className="inline-block pt-1">
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
            </div >
        </>
    )
}