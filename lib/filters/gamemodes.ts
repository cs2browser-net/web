export type GamemodeSpec = {
    name: string;
    searchBy: ("Map" | "Hostname")[];
    text: string | (string | RegExp)[];
};

export const GamemodeSlugs: Record<string, GamemodeSpec> = {
    "zombie-escape": { name: "Zombie Escape", searchBy: ["Map", "Hostname"], text: ["Zombie Escape", "ze_"] },
    surf: { name: "Surf", searchBy: ["Map", "Hostname"], text: ["surf", "surf_"] },
    bunnyhop: { name: "BunnyHop", searchBy: ["Map", "Hostname"], text: ["bhop", "bhop_"] },
    kz: { name: "KZ", searchBy: ["Map"], text: "kz_" },
    deathmatch: { name: "DeathMatch", searchBy: ["Hostname", "Map"], text: ["Deathmatch", "DM", "dm_"] },
    retake: { name: "Retake", searchBy: ["Hostname", "Map"], text: ["retake", "retakes_", "retake_"] },
    public: { name: "Public", searchBy: ["Hostname"], text: "Public" },
    awp: { name: "AWP", searchBy: ["Map", "Hostname"], text: ["awp_", "awp"] },
    aim: { name: "AIM", searchBy: ["Map", "Hostname"], text: ["aim_", "aim"] },
    jailbreak: { name: "Jailbreak", searchBy: ["Map", "Hostname"], text: ["jb_", "jailbreak"] },
    "danger-zone": { name: "Danger Zone", searchBy: ["Map"], text: ["dz_"] },
    zombiemod: { name: "ZombieMod", searchBy: ["Map", "Hostname"], text: ["zm_", "zombie"] },
    "pistol-retake": { name: "Pistol Retake", searchBy: ["Hostname"], text: "Pistol Retake" },
    arena: { name: "Arena", searchBy: ["Map", "Hostname"], text: ["am_", "arena"] },
    prophunt: { name: "PropHunt", searchBy: ["Hostname"], text: ["Prop Hunt", "Prophunt", "PropHunt"] },
    scoutzknivez: { name: "ScoutzKnivez", searchBy: ["Map"], text: "scoutzknivez_" },
    ttt: { name: "TTT", searchBy: ["Map", "Hostname"], text: ["ttt_", "Trouble in Terrorist Town"] },
    minigames: { name: "MiniGames", searchBy: ["Map", "Hostname"], text: ["mg_", "minigame", "mini games"] },
    "1v1": { name: "1v1", searchBy: ["Map", "Hostname"], text: ["am_", "duels_", "1v1"] },
    gungame: { name: "GunGame", searchBy: ["Hostname", "Map"], text: ["Gungame", "Gun Game", "GunGame", "gun game", "gg_"] },
    "5v5": { name: "5v5", searchBy: ["Hostname"], text: "5v5" },
    "combat-surf": {
        name: "Combat Surf",
        searchBy: ["Hostname", "Map"],
        text: ["Surf combat", "Combat Surf", "Surf Combat", "Combat surf", "combat surf", "surf combat"],
    },
    hns: { name: "HNS", searchBy: ["Map", "Hostname"], text: ["hns_", "Hide and Seek"] },
    "only-knife": { name: "Only Knife", searchBy: ["Hostname"], text: "Only Knife" },
    deathrun: { name: "DeathRun", searchBy: ["Map", "Hostname"], text: ["deathrun_", "dr_"] },
    warcraft: { name: "Warcraft", searchBy: ["Hostname"], text: "Warcraft" },
    maniac: { name: "Maniac", searchBy: ["Hostname"], text: "Manian" },
    duels: { name: "Duels", searchBy: ["Map", "Hostname"], text: ["duels_", "1v1"] },
    "fight-yard": { name: "Fight Yard", searchBy: ["Map", "Hostname"], text: ["fy_", "fys_", "Fight Yard"] },
    execute: { name: "Execute", searchBy: ["Map", "Hostname"], text: ["am_", "execute"] },
};

export const mainCategories = [
    'Zombie Escape',
    'Surf',
    'BunnyHop',
    'KZ',
    'DeathMatch',
    'Retake',
    'Public',
    'AWP',
    'Jailbreak',
    'Danger Zone'
];

export const allCategories = [
    ['Zombie Escape', 'Surf', 'BunnyHop', 'KZ', 'DeathMatch', 'Retake', 'Public', 'AWP', 'Jailbreak', 'Danger Zone'],
    ['Pistol Retake', 'Maniac', 'Arena', 'PropHunt', 'ScoutzKnivez', 'TTT', '1v1', 'GunGame', '5v5', 'Combat Surf'],
    ['HNS', 'Only Knife', 'DeathRun', 'MiniGames', 'AIM', 'Duels', 'Fight Yard', 'Execute', 'Warcraft', 'ZombieMod'],
];

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toRegexArray(spec: GamemodeSpec): { field: string; regex: RegExp }[] {
    const values = Array.isArray(spec.text) ? spec.text : [spec.text];
    const fields = Array.isArray(spec.searchBy) ? spec.searchBy : [spec.searchBy];

    const rules: { field: string; regex: RegExp }[] = [];

    for (const field of fields) {
        for (const v of values) {
            if (field === "Map") {
                rules.push({ field, regex: v instanceof RegExp ? v : new RegExp("^" + escapeRegex(String(v)), "i") });
            } else if (field === "Hostname") {
                rules.push({ field, regex: v instanceof RegExp ? v : new RegExp(escapeRegex(String(v)), "i") });
            } else {
                rules.push({ field, regex: v instanceof RegExp ? v : new RegExp("^" + escapeRegex(String(v)) + "$", "i") });
            }
        }
    }
    return rules;
}

export function gamemodeToSlug(gamemode: string): string {
    if (!gamemode || typeof gamemode !== 'string') return "";
    return gamemode.toLowerCase().replace(/\s+/g, '-');
}

export function GetServersByGamemode(servers: any[], gm: string): any[] {
    const spec = GamemodeSlugs[gm];
    if (!spec) return [];

    const patterns = toRegexArray(spec);

    return servers.filter((srv) =>
        patterns.some(({ field, regex }) => regex.test(String(srv?.[field] ?? "")))
    );
}

export function isZombieEscapeServer(server: any): boolean {
    const zeSpec = GamemodeSlugs["zombie-escape"];
    if (!zeSpec) return false;

    const patterns = toRegexArray(zeSpec);

    return patterns.some(({ field, regex }) => regex.test(String(server?.[field] ?? "")));
}