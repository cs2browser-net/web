const allCategories = [
    ['Zombie Escape', 'Surf', 'BunnyHop', 'KZ', 'DeathMatch', 'Retake', 'Public', 'AWP', 'Jailbreak', 'Danger Zone'],
    ['Pistol Retake', 'Maniac', 'Arena', 'PropHunt', 'ScoutzKnivez', 'TTT', '1v1', 'GunGame', '5v5', 'Combat Surf'],
    ['HNS', 'Only Knife', 'DeathRun', 'MiniGames', 'AIM', 'Duels', 'Fight Yard', 'Execute', 'Warcraft', 'ZombieMod'],
];

function gamemodeToSlug(gamemode) {
    if (!gamemode || typeof gamemode !== 'string') return "";
    return gamemode.toLowerCase().replace(/\s+/g, '-');
}

const getAllGamemodeSlugs = () => {
    const allGamemodes = allCategories.flat().filter(Boolean);
    return [...new Set(allGamemodes)].map(gamemodeToSlug).filter(Boolean);
};

const SITE_VARIANT = (process.env.SITE_VARIANT ?? "cs2")

const SiteSettings = {
    cs2: {
        url: "https://cs2browser.net"
    }
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: SiteSettings[SITE_VARIANT].url,
    generateRobotsTxt: true,
    additionalPaths: async (config) => {
        const gamemodeSlugs = getAllGamemodeSlugs();

        return gamemodeSlugs.map((slug) => ({
            loc: `/gamemode/${slug}`,
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString(),
        }));
    },
}