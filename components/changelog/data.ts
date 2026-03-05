export type ChangeType = 'feature' | 'improvement' | 'bugfix' | 'performance';

export interface ChangeItem {
    type: ChangeType;
    title: string;
    description: string;
    details?: string[];
}

export interface ChangelogEntry {
    version?: string;
    date: string;
    changes: {
        feature?: ChangeItem[];
        improvement?: ChangeItem[];
        bugfix?: ChangeItem[];
        performance?: ChangeItem[];
    };
}

export const changelog: ChangelogEntry[] = [
    {
        date: '2026-03-02',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'CSGO Server Browser',
                    description: 'Added CSGO Server Browser at https://csgoservers.net with comprehensive server listing, advanced filtering, and real-time data.',
                    details: []
                }
            ],
            bugfix: [
                {
                    type: 'bugfix',
                    title: "Gamemode names",
                    description: "Fixed gamemode names appearing incorrectly in titles.",
                }
            ]
        }
    },
    {
        date: '2026-03-02',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Rework',
                    description: 'Reworked the design of the website and the performance.',
                    details: []
                }
            ]
        }
    },
    {
        date: '2025-10-14',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Game Version Filter',
                    description: 'Added comprehensive game version filtering system to help users find servers running specific CS2 versions.',
                    details: [
                        'Filter servers by game version (e.g., 1.38.6.8) with server count display',
                        'Support for both INCLUDE and EXCLUDE filtering modes',
                        'Shows version alongside server count (e.g., "1.38.6.8 (5432)")',
                        'Version filter integrated into main filters panel with 5-column responsive layout',
                        'Version filtering available via API parameters (show_versions, hide_versions)',
                        'URL parameter persistence for sharing filtered server lists',
                        'Works seamlessly across main page and gamemode-specific pages'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Swiftly Group Page',
                    description: 'Added dedicated group page showcasing the CS2Browser.net ecosystem and related projects.',
                    details: [
                        'Features SwiftlyS2 framework for Counter-Strike 2 server modifications',
                        'Highlights CS2Browser.net with project descriptions and links',
                        'Responsive 2-column card layout with hover effects',
                        'Professional styling consistent with site theme',
                        'Added to header navigation as a separate menu item'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Mobile Navigation Scrolling',
                    description: 'Fixed mobile navigation menu to support scrolling for better accessibility.',
                    details: [
                        'Added overflow-y-auto to mobile sheet content for vertical scrolling',
                        'Added bottom padding (pb-6) to prevent last items from being cut off',
                        'Ensures all navigation items are accessible on smaller mobile screens',
                        'Maintains smooth scrolling experience across all menu sections'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-09-23',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Server Banner System',
                    description: 'Introduced comprehensive server banner generation system for embedding live server information on websites and forums.',
                    details: [
                        'Large banner (550x95) with server name, IP, map, player count, status, and 24-hour player history graph',
                        'Small banner (350x20) with compact server information and online status indicator',
                        'Real-time data integration with database to show current server status',
                        'Automatic offline detection based on database status checks',
                        'Professional gradient backgrounds with CS2Browser.net branding',
                        'Smart caching with 5-minute cache for online servers and 1-minute for offline',
                        'Banner preview section added to individual server pages',
                        'Copy-to-clipboard functionality for Direct Links, HTML code, and Forum BBCode',
                        'Responsive two-column layout for banner options',
                        'Consistent height containers with centered image alignment'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Zombie Escape Server Algorithm Enhancement',
                    description: 'Significantly improved server ranking algorithm to provide fair treatment for Zombie Escape (ZE) servers regardless of ping.',
                    details: [
                        'ZE servers no longer penalized for high ping in server rankings',
                        'Implemented ZE server detection using map prefixes (ze_) and hostname patterns',
                        'ZE servers exempt from ping-based filtering (show_pings/hide_pings)',
                        'ZE servers bypass high ping threshold penalties (>150ms)',
                        'When comparing ZE vs non-ZE servers, ZE ping is capped at 40ms for fair comparison',
                        'ZE vs ZE comparisons based purely on player count (no ping factor)',
                        'Maintains player count priority to avoid empty servers ranking higher than populated ones',
                        'Ensures global ZE server visibility regardless of geographical location'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Banner Display Optimization',
                    description: 'Enhanced banner preview section with improved layout and user experience.',
                    details: [
                        'Implemented responsive two-column grid layout for desktop (single column on mobile)',
                        'Standardized banner preview container heights for visual consistency',
                        'Centered image alignment within preview containers',
                        'Optimized image rendering with crisp-edges for pixel-perfect banner display',
                        'Improved spacing and visual hierarchy in banner section'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Banner Text Optimization',
                    description: 'Improved banner text display for better readability and cross-platform compatibility.',
                    details: [
                        'Limited map names to 9 characters with ellipsis (...) for longer names',
                        'Replaced Segoe UI with Arial font for universal cross-platform compatibility',
                        'Enhanced text layout consistency across all operating systems',
                        'Improved banner spacing and alignment with standardized text lengths',
                        'Better text rendering in server environments and headless systems'
                    ]
                }
            ],
            performance: [
                {
                    type: 'performance',
                    title: 'Banner Generation Optimization',
                    description: 'Optimized banner generation system for improved performance and reliability.',
                    details: [
                        'Implemented efficient database queries with proper joins for server data',
                        'Added caching layer for banner generation with appropriate TTL',
                        'Optimized image rendering with Canvas for fast banner creation',
                        'Error handling with graceful fallbacks for offline/invalid servers',
                        'Reduced redundant database calls through smart query optimization'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-09-19',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Metrics Dashboard',
                    description: 'Introduced comprehensive metrics dashboard to track CS2Browser.net performance and server statistics.',
                    details: [
                        'Real-time metrics showing Steam API filtered servers, checked servers, and total player counts',
                        'Interactive area charts with 24-hour, 7-day, and 30-day time period views',
                        'Current statistics cards with animated pulse indicators for live data',
                        'Separate chart sections for each metric type with dedicated color coding',
                        'Smart data filtering to exclude zero values for cleaner visualizations',
                        'Mobile-responsive design with optimized chart rendering',
                        'Added to header navigation under Resources section for easy access'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Changed "Show Full Servers" Behaviour',
                    description: 'Changed so that when the "Show Full Servers" is deactivated, all the servers with player count greater than the max players are hidden.',
                    details: []
                }
            ]
        }
    },
    {
        date: '2025-08-31',
        changes: {
            improvement: [
                {
                    type: 'improvement',
                    title: 'Anonymous Player Warning System',
                    description: 'Added warning notification when servers don\'t provide player names, helping users understand why players appear as anonymous.',
                    details: [
                        'Warning box displays above player list when all players have empty names',
                        'Explains that the server needs ServerListPlayersFix plugin for names to appear',
                        'Includes clickable link to ServerListPlayersFix GitHub repository',
                        'Styled with amber warning colors and alert icon for clear visibility',
                        'Only appears when there are players connected with empty names'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-08-29',
        changes: {
            performance: [
                {
                    type: 'performance',
                    title: 'Server API Histogram Performance Enhancement',
                    description: 'Optimized server detail API endpoint with improved histogram data handling and caching.',
                    details: [
                        'Enhanced server query performance with better caching utilization',
                        'Improved histogram data processing for 24h, 7d, and 30d modes',
                        'Reduced database load with optimized query patterns',
                        'Better error handling and validation for server lookups'
                    ]
                }
            ],
            bugfix: [
                {
                    type: 'bugfix',
                    title: 'Removed passworded icon',
                    description: 'Eliminated the passworded icon from server rows for a cleaner UI.',
                    details: []
                }
            ]
        }
    },
    {
        date: '2025-08-28',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Direct Server Connection',
                    description: 'Added one-click server connection functionality directly from the server list.',
                    details: [
                        'Green play button next to each server IP address',
                        'Uses Steam protocol (steam://connect/) for instant connection',
                        'Available on both desktop and mobile interfaces',
                        'Provides visual feedback with toast notifications',
                        'Seamlessly integrated into existing server row design'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced Header Navigation',
                    description: 'Completely redesigned header navigation with organized dropdown menus and server addition functionality.',
                    details: [
                        'Grouped navigation into Browse, Resources, and Support sections',
                        'Add Server button with IP:PORT validation',
                        'Support for multiple server submissions (comma or newline separated)',
                        'Mobile-responsive hamburger menu with full feature parity',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Server Reporting System',
                    description: 'Implemented comprehensive server reporting system with advanced rate limiting.',
                    details: [
                        'Report servers for fake content, inappropriate names, or technical issues',
                        'Task queue integration for automated report processing',
                        'IP address hashing for privacy protection',
                        'Available on individual server detail pages'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Contact Page Enhancements',
                    description: 'Improved FAQ section with clickable links and better spacing.',
                    details: [
                        'Improved spacing between FAQ sections',
                        'Maintained responsive design across all screen sizes'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Server List Layout Optimization',
                    description: 'Refined server list column layout for better visual alignment and spacing.',
                    details: [
                        'Optimized column widths for better content distribution',
                        'Reduced gaps between columns for more compact layout',
                        'Centered IP addresses for better visual alignment',
                        'Dedicated column space for connect buttons',
                        'Consistent alignment across all server list views (main, favorites)'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Server Detail Page Map Display',
                    description: 'Increased map preview size for better visibility of server maps.',
                    details: [
                        'Better proportions for map preview images',
                        'Improved readability of map names and details'
                    ]
                }
            ],
            bugfix: [
                {
                    type: 'bugfix',
                    title: 'Visual Styling Improvements',
                    description: 'Removed background glass effects and fixed various UI inconsistencies.',
                    details: [
                        'Removed distracting animated glass effect from page background',
                        'Maintained static gradient background for visual appeal',
                        'Fixed column header alignment issues in server lists',
                        'Improved button sizing and positioning consistency'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-08-27',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: 'Multi-tag AND Search Functionality',
                    description: 'Enhanced server search with comma-separated multi-tag search supporting AND logic.',
                    details: [
                        'Search multiple terms simultaneously (e.g., "surf,aim" finds servers with both tags)',
                        'Smart regex pattern generation with positive lookaheads',
                        'Preserves original input while processing search logic behind the scenes',
                        'Works seamlessly with existing search features'
                    ]
                },
                {
                    type: 'feature',
                    title: 'NOT Operator for Server Search',
                    description: 'Added exclusion search functionality using the ! prefix to filter out unwanted servers.',
                    details: [
                        'Use ! prefix to exclude servers (e.g., "!combat" excludes combat servers)',
                        'Supports spaces in server names with proper handling',
                        'Combines with multi-tag search (e.g., "surf,!combat" for surf servers without combat)',
                        'Uses negative lookahead patterns for precise filtering'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Interactive Search Tooltip',
                    description: 'Added helpful search tooltip with comprehensive search tips and examples.',
                    details: [
                        'Hover over help icon next to search box for instant guidance',
                        'Documents multi-tag search, NOT operator, regex patterns, and IP filtering',
                        'Portal-rendered to avoid z-index conflicts with other UI elements',
                        'Provides practical examples for different search scenarios'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Comprehensive API Documentation',
                    description: 'Created a complete API documentation page with interactive features and mobile-responsive design.',
                    details: [
                        'Swagger-style expandable endpoint documentation',
                        'Interactive "Try It" buttons with copy functionality',
                        'Responsive layouts: tables for desktop, cards for mobile',
                        'Complete parameter documentation with examples',
                        'All available gamemode slugs included',
                        'Smooth expand/collapse animations'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Contact Page',
                    description: 'Added dedicated contact page with support methods and comprehensive FAQ section.',
                    details: [
                        'Multiple contact methods including email and Discord',
                        'Comprehensive FAQ covering common questions about API usage, server listings, and performance',
                        'Response time expectations and support information',
                        'Mobile-responsive design with 2-column FAQ layout'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Hide/Unhide Server Functionality',
                    description: 'Added comprehensive server hiding system for personalized server browsing.',
                    details: [
                        'Hide individual servers with eye icon on server list and detail pages',
                        'Dedicated /hidden-servers page for managing hidden servers',
                        'Toggle between hide/unhide directly from server detail pages',
                        'Client-side storage with localStorage for persistence across sessions',
                        'API integration to filter hidden servers from main server list',
                        'Visual feedback with toast notifications and status indicators',
                        'Bulk unhide functionality with "Clear All" option'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Enhanced Header Navigation',
                    description: 'Updated header navigation to accommodate new pages with improved spacing and layout.',
                    details: [
                        'Added API Docs and Contact links to main navigation',
                        'Optimized spacing and font sizes for better fit',
                        'Consistent design across desktop and mobile views',
                        'Logical ordering of navigation items for better user flow'
                    ]
                }
            ],
            bugfix: [
                {
                    type: 'bugfix',
                    title: 'Server Name Overflow Fix',
                    description: 'Fixed server name overflow issues on server detail pages for small desktop resolutions.',
                    details: [
                        'Replaced truncation with proper text wrapping using break-words',
                        'Removed problematic overflow-hidden from containers',
                        'Maintained visual hierarchy while preventing text cutoff',
                        'Improved readability for long server names'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-08-26',
        changes: {
            feature: [
                {
                    type: 'feature',
                    title: '3-Mode Ping & Player Sorting',
                    description: 'Added clickable ping and player column header with 3-mode sorting functionality.',
                    details: [
                        'Descending sort: Highest ping first (worst connection)',
                        'Ascending sort: Lowest ping first (best connection)',
                        'None: Clear sorting and return to default algorithm',
                        'Visual arrows indicating current sort direction',
                        'Matches existing players column sorting behavior'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Donation Page',
                    description: 'Added a dedicated donation page to support CS2Browser.net.',
                    details: [
                        'Integrated Ko-fi donation button',
                        'Transparent breakdown of server costs',
                        'Discord Role if you join on our Discord Server'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Enhanced Server Search with Regex Support',
                    description: 'Server name, tags, and IP address search now supports regex patterns.',
                    details: [
                        'Full regex pattern support for advanced search queries',
                        'Graceful fallback to literal string search for invalid regex',
                        'Case-insensitive search for both regex and literal modes',
                        'Search across server hostname, tags, and IP address fields'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Filters',
                    description: 'Updated server filters for better browsing experience.',
                    details: [
                        'Enhanced UI for filter selection and management'
                    ]
                }
            ],
            performance: [
                {
                    type: 'performance',
                    title: 'Query Caching System Implementation',
                    description: 'Implemented comprehensive caching system across all API endpoints to improve performance.',
                    details: [
                        'Added shared cache utility module with SHA-256 key generation',
                        'Database query caching with 1-minute TTL',
                        'Ping calculation caching with 5-minute TTL and coordinate optimization',
                        'Applied caching to /api/servers, /api/filters, and /api/server endpoints'
                    ]
                }
            ]
        }
    },
    {
        date: '2025-08-26',
        changes: {
            bugfix: [
                {
                    type: 'bugfix',
                    title: 'Filtering and Display Fixes',
                    description: 'Resolved several issues with filtering and visibility in the server list.',
                    details: [
                        'Fixed hostname and map-based filtering',
                        'Empty servers are now displayed by default',
                        'Corrected mobile view layout issues'
                    ]
                }
            ],
            improvement: [
                {
                    type: 'improvement',
                    title: 'Regional Server Prioritization',
                    description: 'Server list now prioritizes servers closer to the user’s region for better ping and connectivity.',
                    details: [
                        'Region-based sorting applied automatically',
                        'Improved accuracy of region detection',
                        'Fallback to global list if no regional servers available'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Region Filtering',
                    description: 'Added user-selectable region filtering to refine server searches.',
                    details: [
                        'Dropdown selector for available regions',
                        'Works in combination with other filters and sorting',
                        'Provides better control over server browsing experience'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Updated "Copy IP" Format',
                    description: 'The "Copy IP" button now uses the standard Source engine connect format.',
                    details: [
                        'New format: `connect IP:PORT`',
                        'Ensures direct compatibility with in-game console commands'
                    ]
                }
            ],
            feature: [
                {
                    type: 'feature',
                    title: 'Discord Support Server Integration',
                    description: 'Introduced a dedicated Discord support server for community and server management.',
                    details: [
                        'Ticket bot for missing servers (usually due to manual blocks)',
                        'Server request bot for review, approval, or denial of server submissions',
                        'Central hub for community support and announcements'
                    ]
                }
            ]
        }
    }

];

export const getTypeColor = (type: ChangeType) => {
    switch (type) {
        case 'feature':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'improvement':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'bugfix':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'performance':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
};

export const getTypeIcon = (type: ChangeType) => {
    switch (type) {
        case 'feature':
            return '✨';
        case 'improvement':
            return '🔧';
        case 'bugfix':
            return '🐛';
        case 'performance':
            return '⚡';
    }
};

export const getTypeName = (type: ChangeType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
};

export const hasChanges = (entry: ChangelogEntry) => {
    return Object.values(entry.changes).some(changes => changes && changes.length > 0);
};