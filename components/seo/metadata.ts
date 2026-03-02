import { Metadata, Viewport } from "next";

export const defaultMetadata: Metadata = {
    title: "CS2Browser.net - Find Counter-Strike 2 servers",
    description: "Discover and join Counter-Strike 2 servers worldwide. Browse CS2 servers by gamemode, location, ping, and player count. Find the perfect CS2 server for competitive matches, casual games, and community servers.",
    keywords: "CS2 servers, Counter-Strike 2, CS2 browser, server list, CS2 multiplayer, competitive CS2, CS2 community servers, find CS2 servers, CS2 server browser, Counter-Strike 2 servers, CS2 ping, CS2 maps, CS2 gamemode, CS2 deathmatch, CS2 competitive, CS2 casual, zombie escape, bhop, surf, CS2 retakes, CS2 1v1, awp servers, pistol only, headshot only, CS2 mod servers, European CS2 servers, American CS2 servers, Asian CS2 servers, low ping CS2, CS2 server search, CS2 gaming, esports servers,CS2 Sunucu Listesi, CS2 Sunucuları, Counter-Stike 2 Server Listesi İndir, CS 2 Server List İndir, CS 2 Server Listesi İndir,CS2 sunucuları, CS2 sunucu listesi, CS2 sunucu tarayıcısı, CS2 sunucusu bulma, Counter-Strike 2 sunucuları, CS2 çok oyunculu sunucular, CS2 rekabetçi sunucular, CS2 topluluk sunucuları, CS2 mod sunucuları, CS2 ping test, CS2 düşük ping sunucular, Avrupa CS2 sunucuları, Amerika CS2 sunucuları, Asya CS2 sunucuları, CS2 haritaları, CS2 oyun modları, CS2 ölüm maçı (Deathmatch) sunucuları, CS2 rekabetçi (Competitive) sunucular, CS2 gündelik (Casual) sunucular, AWP sunucuları, Sadece tabanca (Pistols) sunucuları, Sadece kafadan vuruş (Headshot only) sunucuları, CS2 sunucu arama, CS2 oyun tarayıcısı, Espor CS2 sunucuları",
    robots: "index, follow",
    authors: [
        {
            name: "Swiftly Development Team",
            url: "https://swiftlys2.net",
        }
    ],
    openGraph: {
        title: "CS2Browser.net - Find Counter-Strike 2 servers",
        description: "Discover and join Counter-Strike 2 servers worldwide. Browse CS2 servers by gamemode, location, ping, and player count. Find the perfect CS2 server for competitive matches, casual games, and community servers.",
        url: "https://cs2browser.net",
        type: "website",
        siteName: "CS2Browser.net",
    },
    twitter: {
        card: "summary_large_image",
        title: "CS2Browser.net - Find Counter-Strike 2 servers",
        description: "Discover and join Counter-Strike 2 servers worldwide. Browse CS2 servers by gamemode, location, ping, and player count. Find the perfect CS2 server for competitive matches, casual games, and community servers.",
    },
}

export const defaultViewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
    themeColor: "#00feed"
}

export const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CS2Browser.net",
    "description": "Discover and join Counter-Strike 2 servers worldwide. Browse CS2 servers by gamemode, location, ping, and player count.",
    "url": "https://cs2browser.net",
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://cs2browser.net?serverName={search_term_string}"
        },
        "query-input": "required name=search_term_string"
    },
    "sameAs": [
        "https://cs2browser.net/discord"
    ],
    "publisher": {
        "@type": "Organization",
        "name": "CS2Browser.net",
        "url": "https://cs2browser.net"
    },
    "audience": {
        "@type": "Audience",
        "audienceType": "Gamers",
        "geographicArea": "Worldwide"
    },
    "about": {
        "@type": "VideoGame",
        "name": "Counter-Strike 2",
        "alternateName": "CS2",
        "genre": "First-person shooter",
        "publisher": {
            "@type": "Organization",
            "name": "Valve Corporation"
        }
    }
}