export interface APIEndpoint {
    path: string;
    method: string;
    summary: string;
    description: string;
    parameters?: Array<{
        name: string;
        in: string;
        description: string;
        required: boolean;
        type: string;
        example?: any;
    }>;
    responses: {
        [key: string]: {
            description: string;
            example: any;
        }
    };
}

export const apiEndpoints: APIEndpoint[] = [
    {
        path: "/api/location",
        method: "GET",
        summary: "Get client location information",
        description: "Returns the geographical location data based on the client's IP address. Used for calculating ping estimates and regional filtering.",
        responses: {
            "200": {
                description: "Location data retrieved successfully",
                example: {
                    lat: 40.7128,
                    lon: -74.0060
                }
            },
            "403": {
                description: "Method not allowed - only GET requests accepted",
                example: { error: "Method not allowed" }
            }
        }
    },
    {
        path: "/api/filters",
        method: "GET",
        summary: "Get available filter options",
        description: "Returns all available continents, countries, maps, and game versions that can be used for filtering servers. Each option includes the number of servers available.",
        responses: {
            "200": {
                description: "Filter options retrieved successfully",
                example: {
                    continents: {
                        "eu": "Europe (1245)",
                        "na": "North America (892)",
                        "as": "Asia (654)"
                    },
                    countries: {
                        "us": {
                            name: "United States (456)",
                            continent: "na",
                            count: 456
                        },
                        "de": {
                            name: "Germany (234)",
                            continent: "eu",
                            count: 234
                        }
                    },
                    maps: {
                        "de_dust2": "de_dust2 (123)",
                        "de_mirage": "de_mirage (98)"
                    },
                    versions: {
                        "1.38.6.8": "1.38.6.8 (5432)",
                        "1.38.6.7": "1.38.6.7 (234)"
                    }
                }
            },
            "403": {
                description: "Method not allowed",
                example: { error: "Method not allowed" }
            }
        }
    },
    {
        path: "/api/servers",
        method: "GET",
        summary: "Get server list with filtering and pagination",
        description: "Returns a paginated list of CS2 servers with comprehensive filtering options. Supports gamemode filtering, geographical filtering, ping filtering, player count filtering, and text search.\nThe pages are having 50 items.",
        parameters: [
            {
                name: "page",
                in: "query",
                description: "Page number for pagination (0-based)",
                required: false,
                type: "number",
                example: 0
            },
            {
                name: "gamemode",
                in: "query",
                description: "Filter by specific gamemode slug. Available slugs: zombie-escape, surf, bunnyhop, kz, deathmatch, retake, public, awp, aim, jailbreak, zombiemod, pistol-retake, arena, prophunt, scoutzknivez, ttt, minigames, 1v1, gungame, 5v5, combat-surf, hns, only-knife, deathrun, football, warcraft, maniac, duels, fight-yard, execute",
                required: false,
                type: "string",
                example: "surf"
            },
            {
                name: "server_name",
                in: "query",
                description: "Search in server name, tags, or IP. Supports regex, comma-separated AND search, and NOT operator (!)",
                required: false,
                type: "string",
                example: "surf,!combat"
            },
            {
                name: "show_continents",
                in: "query",
                description: "Comma-separated list of continents to include",
                required: false,
                type: "string",
                example: "eu,na"
            },
            {
                name: "hide_continents",
                in: "query",
                description: "Comma-separated list of continents to exclude",
                required: false,
                type: "string",
                example: "as,af"
            },
            {
                name: "show_countries",
                in: "query",
                description: "Comma-separated list of country codes to include",
                required: false,
                type: "string",
                example: "us,de,gb"
            },
            {
                name: "hide_countries",
                in: "query",
                description: "Comma-separated list of country codes to exclude",
                required: false,
                type: "string",
                example: "cn,ru"
            },
            {
                name: "show_maps",
                in: "query",
                description: "Comma-separated list of map names to include",
                required: false,
                type: "string",
                example: "de_dust2,de_mirage"
            },
            {
                name: "hide_maps",
                in: "query",
                description: "Comma-separated list of map names to exclude",
                required: false,
                type: "string",
                example: "de_aztec"
            },
            {
                name: "show_versions",
                in: "query",
                description: "Comma-separated list of game versions to include",
                required: false,
                type: "string",
                example: "1.38.6.8,1.38.6.7"
            },
            {
                name: "hide_versions",
                in: "query",
                description: "Comma-separated list of game versions to exclude",
                required: false,
                type: "string",
                example: "1.38.6.5"
            },
            {
                name: "show_pings",
                in: "query",
                description: "Comma-separated list of ping thresholds to include (≤ value)",
                required: false,
                type: "string",
                example: "50,100"
            },
            {
                name: "hide_pings",
                in: "query",
                description: "Comma-separated list of ping thresholds to exclude (> value)",
                required: false,
                type: "string",
                example: "150"
            },
            {
                name: "hide_empty_servers",
                in: "query",
                description: "Hide servers with 0 players",
                required: false,
                type: "boolean",
                example: "1"
            },
            {
                name: "show_full_servers",
                in: "query",
                description: "Include servers at max capacity",
                required: false,
                type: "boolean",
                example: "1"
            },
            {
                name: "servers",
                in: "query",
                description: "Comma-separated list of specific server IDs to retrieve",
                required: false,
                type: "string",
                example: "123,456,789"
            },
            {
                name: "player_sort",
                in: "query",
                description: "Sort by player count",
                required: false,
                type: "string",
                example: "desc"
            },
            {
                name: "ping_sort",
                in: "query",
                description: "Sort by ping",
                required: false,
                type: "string",
                example: "asc"
            }
        ],
        responses: {
            "200": {
                description: "Server list retrieved successfully",
                example: {
                    servers: [
                        {
                            server_id: 123,
                            hostname: "Example Surf Server",
                            address: "192.168.1.1:27015",
                            map: "surf_mesa",
                            players_count: 24,
                            max_players: 32,
                            bots_count: 0,
                            secure: true,
                            version: "1.38.6.8",
                            tags: "surf,beginner",
                            country: "us",
                            lat: 40.7128,
                            lon: -74.0060,
                            real_players: 24
                        }
                    ],
                    total_count: 1542
                }
            },
            "403": {
                description: "Method not allowed",
                example: { error: "Method not allowed" }
            }
        }
    },
    {
        path: "/api/server",
        method: "GET",
        summary: "Get detailed server information",
        description: "Returns detailed information about a specific server including current players and player count history.",
        parameters: [
            {
                name: "server_id",
                in: "query",
                description: "Unique server identifier",
                required: true,
                type: "number",
                example: 123
            },
            {
                name: "mode",
                in: "query",
                description: "Histogram time range: 1 (24h), 2 (7d), 3 (30d)",
                required: false,
                type: "string",
                example: "1"
            }
        ],
        responses: {
            "200": {
                description: "Server details retrieved successfully",
                example: {
                    server_info: {
                        server_id: 123,
                        hostname: "Example Surf Server",
                        address: "192.168.1.1:27015",
                        map: "surf_mesa",
                        players_count: 24,
                        max_players: 32,
                        bots_count: 0,
                        secure: true,
                        version: "1.38.6.8",
                        tags: "surf,beginner",
                        country: "us",
                        lat: 40.7128,
                        lon: -74.0060
                    },
                    players: [
                        {
                            Name: "PlayerName",
                            Score: 1500,
                            Duration: 3600
                        }
                    ],
                    player_histogram: {
                        "2024-01-01 10:00:00": 15,
                        "2024-01-01 11:00:00": 20,
                        "2024-01-01 12:00:00": 24
                    }
                }
            },
            "403": {
                description: "Method not allowed",
                example: { error: "Method not allowed" }
            }
        }
    }
];