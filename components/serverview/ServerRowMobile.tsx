"use client";

import { Copy, EyeOff, Play, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EstimatePing } from "@/lib/location/ping";
import { useLocationStore } from "@/lib/location/store";
import { toast } from "sonner";
import { useHiddenServers } from "@/lib/client-storage/hidden-servers";
import { useFavouriteServers } from "@/lib/client-storage/favourite-servers";
import { PingBars } from "./ServerRow";
import { ServerAndServerData } from "@/lib/api/data";

export interface ServerRowMobileProps {
    isEven: boolean;
    server: ServerAndServerData;
}

export default function ServerRowMobile({ isEven, server }: ServerRowMobileProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    const location = useLocationStore(state => state.location);
    const hiddenServers = useHiddenServers();
    const favouriteServers = useFavouriteServers();

    const ping = useMemo(() => EstimatePing(server.Server.latitute, server.Server.longitude, location?.latitude, location?.longitude), [server, location]);

    const handleCopyIP = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(`connect ${server.Server.address}`);
        toast.success('Copy Address', {
            description: 'IP address copied to clipboard!',
            icon: <Copy className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleConnect = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const steamConnectUrl = `steam://connect/${server.Server.address}`;
        window.location.href = steamConnectUrl;
        toast.success('Connecting to server...', {
            icon: <Play className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleHideServer = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hiddenServers.toggleHidden(server.Server.id);
        toast.success('Server hidden! Refresh to see changes.', {
            icon: <EyeOff className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = favouriteServers.toggleFavourite(server.Server.id);
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
        <div
            onClick={() => { }}
            className={`
                cursor-pointer px-3 py-4 transition-colors duration-200
                ${isEven ? 'bg-gray-800/25' : 'bg-gray-800/10'}
                border-b border-gray-800/30 hover:bg-[#00feed]/8
            `}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center flex-1 mr-3">
                    <div className="flex-1">
                        <Link href={`/server/${server.Server.id}`} prefetch={"auto"}>
                            <div className="text-white text-base font-base break-word leading-tight hover:text-[#00feed] transition-colors cursor-pointer">
                                {server.ServerData.hostname.length > 35 ? `${server.ServerData.hostname.substring(0, 35)}...` : server.ServerData.hostname}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-base">
                <div className="flex items-center flex-1 mr-3">
                    <div className="shrink-0 mr-2 flex items-center">
                        <img src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${server.Server.country}.svg`} alt={server.Server.country} style={{ width: '1.25em', height: '1em' }} />
                    </div>
                    <button
                        onClick={handleCopyIP}
                        className="text-gray-300 text-xs font-mono hover:text-[#00feed] hover:bg-gray-800/40 px-2 py-1.5 rounded transition-colors duration-200 group flex items-center"
                        title="Click to copy IP"
                    >
                        <span className="mr-1">{server.Server.address}</span>
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-white text-base font-mono font-base">
                            {server.ServerData.playersCount}/{server.ServerData.maxPlayers}
                        </span>
                        {server.ServerData.botsCount > 0 && (
                            <span className="text-xs text-gray-500 mt-0.5">
                                ({server.ServerData.botsCount} bot{server.ServerData.botsCount > 1 ? "s" : ""})
                            </span>
                        )}
                    </div>
                    <div className="scale-75">
                        <PingBars ping={ping} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-base mt-2">
                <div className="flex items-center space-x-4 text-gray-400 min-w-0 flex-1">
                    <button
                        onClick={handleToggleFavorite}
                        className={`p-1 rounded hover:bg-gray-700/50 transition-colors mr-2 ${favouriteServers.isFavourite(server.Server.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                        title={favouriteServers.isFavourite(server.Server.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className={`h-3.5 w-3.5 ${favouriteServers.isFavourite(server.Server.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleHideServer}
                        className="p-1 rounded hover:bg-gray-700/50 transition-colors mr-2 text-gray-500 hover:text-red-500"
                        title="Hide this server"
                    >
                        <EyeOff className="h-3.5 w-3.5" />
                    </button>
                    <span className="relative z-10 text-white font-mono truncate">
                        {server.ServerData.map.length > 13 ? `${server.ServerData.map.substring(0, 13)}...` : server.ServerData.map}
                    </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                        onClick={handleConnect}
                        className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded transition-colors duration-200 flex items-center justify-center"
                        title="Connect to server via Steam"
                    >
                        <Play className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

