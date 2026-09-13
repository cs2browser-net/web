export const SITE_VARIANT = (process.env.NEXT_PUBLIC_SITE_VARIANT ??
    "cs2") as "cs2";

export const SiteSettings: Record<string, any> = {
    cs2: {
        url: "https://cs2browser.net",
        name: "CS2Browser.net",
        gamename: "Counter-Strike 2",
        domain: "cs2browser.net",
    },
};
