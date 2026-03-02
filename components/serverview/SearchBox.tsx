"use client";

import { Filter, RefreshCcw, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge"
import { Server, ServerData } from "@/generated/prisma/browser";
import { countActiveFilters, useFiltersStore } from "@/lib/filters/store";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SearchBoxProps {
    onToggleFilters: () => void;
    servers?: {
        servers: (({ server: Server }) & ServerData)[];
        count: number;
    };
}

export default function SearchBox({ onToggleFilters, servers }: SearchBoxProps) {
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const filters = useFiltersStore((state) => state);
    const trpcUtils = trpc.useUtils();

    const handleServerNameChange = useCallback((value: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            filters.setFilters({ ...filters.filters, serverName: value });
        }, 300);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        toast('Refreshing server list...', {
            icon: <RefreshCw className="h-4 w-4 animate-spin" />,
            duration: 1000,
        });

        setTimeout(() => {
            trpcUtils.servers.fetchServers.invalidate();
            setRefreshing(false);
            toast.success('Server list updated!', {
                duration: 2000,
            })
        }, 1500);
    }

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-2 items-start">
            <div className="relative flex-1 w-full">
                <InputGroup className="h-12 bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-400 focus-visible:border-[#00feed] focus-visible:ring-[#00feed]/20">
                    <InputGroupInput
                        placeholder="Search server name, tag or IP..."
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => handleServerNameChange(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align={"inline-end"}>
                        {servers?.count ?? 0} servers found
                    </InputGroupAddon>
                </InputGroup>
                <div
                    className={`
                        absolute top-full left-0 right-0 px-3 py-2 text-sm text-gray-300 
                        bg-gray-800 border border-gray-700/50 border-t-0 
                        rounded-b-md shadow-lg
                        transition-all duration-300 ease-in-out
                        ${isFocused
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                        }
                    `}
                >
                    Type to search across server names, tags, and IP addresses. This input supports regex for advanced filtering.
                </div>
            </div>
            <div className="w-full md:w-auto gap-2 flex md:flex-row flex-col">
                <Button
                    className="h-12 bg-gray-800/60 border-gray-700/50 text-white hover:bg-gray-700/60 hover:border-[#00feed] transition-colors"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                    onClick={onToggleFilters}
                    className="h-12 bg-gray-800/60 border-gray-700/50 text-white hover:bg-gray-700/60 hover:border-[#00feed] transition-colors"
                    variant="outline"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    <Badge variant={"default"} className="ml-2">
                        {countActiveFilters(filters.filters)}
                    </Badge>
                </Button>
            </div>
        </div>
    )
}