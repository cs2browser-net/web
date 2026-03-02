import { Filter, RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { trpc } from "@/lib/trpc/client";
import { useFiltersStore } from "@/lib/filters/store";

export default function EmptyState() {
    const trpcUtils = trpc.useUtils();
    const filters = useFiltersStore();

    return (
        <div className="text-center py-16 px-4">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl text-gray-300 mb-2">No servers found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn{"'"}t find any servers matching your current filters. Try adjusting your search criteria or region settings.
            </p>
            <div className="flex justify-center space-x-4">
                <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    onClick={() => trpcUtils.servers.fetchServers.invalidate()}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh List
                </Button>
                <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    onClick={() => {
                        filters.setFilters({
                            continents: {
                                show: [],
                                hide: []
                            },
                            countries: {
                                show: [],
                                hide: []
                            },
                            maps: {
                                show: [],
                                hide: []
                            },
                            versions: {
                                show: [],
                                hide: []
                            },
                            pings: {
                                show: [],
                                hide: []
                            },
                            showFullServers: true,
                            hideEmptyServers: false,
                            serverName: ""
                        })
                    }}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                </Button>
            </div>
        </div>
    )
}