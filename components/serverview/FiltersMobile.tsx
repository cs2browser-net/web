"use client";

import { Filter } from "lucide-react";
import FilterDropdown from "../filters/Dropdown";
import { useCallback } from "react";
import { useFiltersStore } from "@/lib/filters/store";
import { Switch } from "../ui/switch";

interface FiltersMobileProps {
    isOpen: boolean;
    onClose: () => void;
}

const pingOptions = [
    { code: '50', name: '≤50ms' },
    { code: '75', name: '≤75ms' },
    { code: '100', name: '≤100ms' },
    { code: '150', name: '≤150ms' },
    { code: '175', name: '≤175ms' },
    { code: '250', name: '≤250ms' },
];

export default function FiltersMobile({ isOpen, onClose }: FiltersMobileProps) {
    const { filters, setFilters, filtersData } = useFiltersStore(state => state);

    const handlePingChange = useCallback((pingCode: string, action: 'add-show' | 'add-hide' | 'remove') => {
        const ping = Number(pingCode);
        if (action == 'add-show') {
            setFilters({
                ...filters,
                pings: {
                    show: [...filters.pings.show.filter(p => p !== ping), ping],
                    hide: filters.pings.hide.filter(p => p !== ping)
                }
            })
        } else if (action == 'add-hide') {
            setFilters({
                ...filters,
                pings: {
                    show: filters.pings.show.filter(p => p !== ping),
                    hide: [...filters.pings.hide.filter(p => p !== ping), ping]
                }
            })
        } else if (action == 'remove') {
            setFilters({
                ...filters,
                pings: {
                    show: filters.pings.show.filter(p => p !== ping),
                    hide: filters.pings.hide.filter(p => p !== ping)
                }
            })
        }
    }, [filters, setFilters]);

    const handleVersionChange = useCallback((version: string, action: 'add-show' | 'add-hide' | 'remove') => {
        if (action == 'add-show') {
            setFilters({
                ...filters,
                versions: {
                    show: [...filters.versions.show.filter(v => v !== version), version],
                    hide: filters.versions.hide.filter(v => v !== version)
                }
            })
        } else if (action == 'add-hide') {
            setFilters({
                ...filters,
                versions: {
                    show: filters.versions.show.filter(v => v !== version),
                    hide: [...filters.versions.hide.filter(v => v !== version), version]
                }
            })
        } else if (action == 'remove') {
            setFilters({
                ...filters,
                versions: {
                    show: filters.versions.show.filter(v => v !== version),
                    hide: filters.versions.hide.filter(v => v !== version)
                }
            })
        }
    }, [filters, setFilters]);

    const handleMapChange = useCallback((map: string, action: 'add-show' | 'add-hide' | 'remove') => {
        if (action == 'add-show') {
            setFilters({
                ...filters,
                maps: {
                    show: [...filters.maps.show.filter(v => v !== map), map],
                    hide: filters.maps.hide.filter(v => v !== map)
                }
            })
        } else if (action == 'add-hide') {
            setFilters({
                ...filters,
                maps: {
                    show: filters.maps.show.filter(v => v !== map),
                    hide: [...filters.maps.hide.filter(v => v !== map), map]
                }
            })
        } else if (action == 'remove') {
            setFilters({
                ...filters,
                maps: {
                    show: filters.maps.show.filter(v => v !== map),
                    hide: filters.maps.hide.filter(v => v !== map)
                }
            })
        }
    }, [filters, setFilters]);

    const handleCountriesChange = useCallback((country: string, action: 'add-show' | 'add-hide' | 'remove') => {
        if (action == 'add-show') {
            setFilters({
                ...filters,
                countries: {
                    show: [...filters.countries.show.filter(v => v !== country), country],
                    hide: filters.countries.hide.filter(v => v !== country)
                }
            })
        } else if (action == 'add-hide') {
            setFilters({
                ...filters,
                countries: {
                    show: filters.countries.show.filter(v => v !== country),
                    hide: [...filters.countries.hide.filter(v => v !== country), country]
                }
            })
        } else if (action == 'remove') {
            setFilters({
                ...filters,
                countries: {
                    show: filters.countries.show.filter(v => v !== country),
                    hide: filters.countries.hide.filter(v => v !== country)
                }
            })
        }
    }, [filters, setFilters]);

    const handleContinentsChange = useCallback((continent: string, action: 'add-show' | 'add-hide' | 'remove') => {
        if (action == 'add-show') {
            setFilters({
                ...filters,
                continents: {
                    show: [...filters.continents.show.filter(v => v !== continent), continent],
                    hide: filters.continents.hide.filter(v => v !== continent)
                }
            })
        } else if (action == 'add-hide') {
            setFilters({
                ...filters,
                continents: {
                    show: filters.continents.show.filter(v => v !== continent),
                    hide: [...filters.continents.hide.filter(v => v !== continent), continent]
                }
            })
        } else if (action == 'remove') {
            setFilters({
                ...filters,
                continents: {
                    show: filters.continents.show.filter(v => v !== continent),
                    hide: filters.continents.hide.filter(v => v !== continent)
                }
            })
        }
    }, [filters, setFilters]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm z-50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="bg-gray-800/95 backdrop-blur-md border-l border-gray-700/50 h-full p-4 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/50">
                        <Filter className="w-5 h-5 text-white" />
                        <h2 className="text-lg text-white">Filters</h2>
                    </div>

                    <div className="space-y-6">
                        <FilterDropdown
                            items={filtersData.continents ? Object.entries(filtersData.continents).map(([code, name]) => ({ code, name })) : []}
                            filters={filters}
                            filterType={"continents"}
                            onChange={handleContinentsChange}
                            placeholder="Filter by continent..."
                        />
                        <FilterDropdown
                            items={Object.entries(filtersData.countries).map(([code, name]) => ({ code, name: name.name }))}
                            filters={filters}
                            filterType={"countries"}
                            onChange={handleCountriesChange}
                            placeholder="Filter by region..."
                        />
                        <FilterDropdown
                            items={filtersData.maps ? Object.entries(filtersData.maps).map(([code, name]) => ({ code, name })) : []}
                            filters={filters}
                            filterType={"maps"}
                            onChange={handleMapChange}
                            placeholder="Filter by map..."
                        />
                        <FilterDropdown
                            items={filtersData.versions ? Object.entries(filtersData.versions).map(([code, name]) => ({ code, name })) : []}
                            filters={filters}
                            filterType={"versions"}
                            onChange={handleVersionChange}
                            placeholder="Filter by version..."
                        />
                        <FilterDropdown
                            items={pingOptions}
                            filters={filters}
                            filterType={"pings"}
                            onChange={handlePingChange}
                            placeholder="Filter by ping..."
                        />

                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                            <span className="text-white font-medium text-sm">Hide Empty Servers</span>
                            <Switch
                                checked={filters.hideEmptyServers}
                                onCheckedChange={(checked) => setFilters({ ...filters, hideEmptyServers: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                            <span className="text-white font-medium text-sm">Show Full Servers</span>
                            <Switch
                                checked={filters.showFullServers}
                                onCheckedChange={(checked) => setFilters({ ...filters, showFullServers: checked })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
