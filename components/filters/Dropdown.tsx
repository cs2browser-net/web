import { FilterState } from "@/lib/filters/store";
import { ChevronDown, Circle, Eye, EyeOff, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FiltersComponentProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

function isNumberArray(arr: number[] | string[]): arr is number[] {
    return arr.every(v => typeof v === "number");
}

interface FilterDropdownProps {
    items: Array<{ code: string; name: string }>;
    filters: FilterState;
    filterType: 'continents' | 'countries' | 'maps' | 'versions' | 'pings';
    onChange: (itemCode: string, action: 'add-show' | 'add-hide' | 'remove') => void;
    placeholder: string;
}

const FilterDropdown = memo(function FilterDropdown({ items, filters, filterType, onChange, placeholder }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const showSearch = filterType !== 'continents' && filterType !== 'pings';

    const filteredItems = useMemo(() => {
        if (!showSearch || !searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item => item.name.toLowerCase().includes(query));
    }, [items, searchQuery, showSearch]);

    const getItemStatus = useCallback((itemCode: string) => {
        const filterObj = filters[filterType];

        if (isNumberArray(filterObj.show)) {
            if (filterObj.show.includes(Number(itemCode))) return 'show';
        } else {
            if (filterObj.show.includes(itemCode)) return 'show';
        }

        if (isNumberArray(filterObj.hide)) {
            if (filterObj.hide.includes(Number(itemCode))) return 'hide';
        } else {
            if (filterObj.hide.includes(itemCode)) return 'hide';
        }

        return 'none';
    }, [filters, filterType]);

    const getStatusIcon = useCallback((status: 'show' | 'hide' | 'none') => {
        switch (status) {
            case 'show':
                return <Eye className="w-4 h-4 text-green-400" />;
            case 'hide':
                return <EyeOff className="w-4 h-4 text-red-400" />;
            default:
                return <Circle className="w-4 h-4 text-gray-500" />;
        }
    }, []);

    const getActiveCount = useMemo(() => {
        const filterObj = filters[filterType];
        return filterObj.show.length + filterObj.hide.length;
    }, [filters, filterType]);

    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    }, []);

    const handleToggle = useCallback(() => {
        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (isOpen && searchInputRef.current && showSearch) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen, showSearch]);

    const handleItemClick = useCallback((itemCode: string, currentStatus: 'show' | 'hide' | 'none') => {
        // Cycle through: none -> show -> hide -> none
        if (currentStatus === 'none') {
            onChange(itemCode, 'add-show');
        } else if (currentStatus === 'show') {
            onChange(itemCode, 'add-hide');
        } else {
            onChange(itemCode, 'remove');
        }
    }, [onChange]);

    useEffect(() => {
        if (isOpen) {
            let ticking = false;
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updatePosition();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            const handleResize = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updatePosition();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [isOpen, updatePosition]);

    const dropdownContent = isOpen && dropdownPosition && (
        <>
            <div
                className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col"
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    minWidth: dropdownPosition.width,
                    maxWidth: '320px'
                }}
            >
                {showSearch && (
                    <div className="p-3 border-b border-gray-700 bg-gray-800/95 sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#00feed] focus:ring-1 focus:ring-[#00feed]/20 transition-colors text-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto max-h-96">
                    {filteredItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No items found
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const status = getItemStatus(item.code);
                            return (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => {
                                        handleItemClick(item.code, status);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-700/50 flex items-center justify-between transition-colors min-h-[44px]"
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {getStatusIcon(status)}
                                        <span className="text-white truncate">{item.name}</span>
                                    </div>
                                    {(filterType === 'pings' || filterType === 'continents' || filterType === 'countries' || filterType === 'maps' || filterType === 'versions') && (
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${status === 'show' ? 'bg-green-600 text-white' :
                                            status === 'hide' ? 'bg-red-600 text-white' :
                                                'bg-gray-600 text-gray-300'
                                            }`}>
                                            {status === 'show' ? 'INCLUDE' : status === 'hide' ? 'EXCLUDE' : 'OFF'}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
            <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
            />
        </>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                className="w-full px-4 py-3 bg-input/30 border border-gray-700/50 rounded-lg text-white focus:border-[#00feed] focus:ring-1 focus:ring-[#00feed]/20 transition-colors text-left flex items-center justify-between"
            >
                <span>
                    {getActiveCount > 0 ? `${getActiveCount} filtered` : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    );
});
FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;