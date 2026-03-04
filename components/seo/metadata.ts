import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const defaultMetadata: Metadata = {
    title: SiteSettings[SITE_VARIANT].name + " - Find " + SiteSettings[SITE_VARIANT].gamename + " servers",
    description: "Discover and join " + SiteSettings[SITE_VARIANT].gamename + " servers worldwide. Browse " + SITE_VARIANT.toUpperCase() + " servers by gamemode, location, ping, and player count. Find the perfect " + SITE_VARIANT.toUpperCase() + " server for competitive matches, casual games, and community servers.",
    keywords: "CSGO servers, Counter-Strike 2, CSGO browser, server list, CSGO multiplayer, competitive CSGO, CSGO community servers, find CSGO servers, CSGO server browser, Counter-Strike 2 servers, CSGO ping, CSGO maps, CSGO gamemode, CSGO deathmatch, CSGO competitive, CSGO casual, zombie escape, bhop, surf, CSGO retakes, CSGO 1v1, awp servers, pistol only, headshot only, CSGO mod servers, European CSGO servers, American CSGO servers, Asian CSGO servers, low ping CSGO, CSGO server search, CSGO gaming, esports servers,CSGO Sunucu Listesi, CSGO Sunucuları, Counter-Stike 2 Server Listesi İndir, CS 2 Server List İndir, CS 2 Server Listesi İndir,CSGO sunucuları, CSGO sunucu listesi, CSGO sunucu tarayıcısı, CSGO sunucusu bulma, Counter-Strike 2 sunucuları, CSGO çok oyunculu sunucular, CSGO rekabetçi sunucular, CSGO topluluk sunucuları, CSGO ping, CSGO haritalar, CSGO oyun modları, CSGO deathmatch sunucuları, CSGO rekabetçi sunucular, CSGO sıradan sunucular, zombie escape sunucuları, bhop sunucuları, surf sunucuları, CSGO retakes sunucuları, CSGO 1v1 sunucuları, awp sunucuları, sadece tabanca sunucuları, sadece headshot sunucuları, CSGO mod sunucuları, Avrupa CSGO sunucuları, Amerika CSGO sunucuları, Asya CSGO sunucuları, düşük ping CSGO sunucuları, CSGO sunucu arama, CSGO oyunları, CS2 servers, Counter-Strike 2, CS2 browser, server list, CS2 multiplayer, competitive CS2, CS2 community servers, find CS2 servers, CS2 server browser, Counter-Strike 2 servers, CS2 ping, CS2 maps, CS2 gamemode, CS2 deathmatch, CS2 competitive, CS2 casual, zombie escape, bhop, surf, CS2 retakes, CS2 1v1, awp servers, pistol only, headshot only, CS2 mod servers, European CS2 servers, American CS2 servers, Asian CS2 servers, low ping CS2, CS2 server search, CS2 gaming, esports servers,CS2 Sunucu Listesi, CS2 Sunucuları, Counter-Stike 2 Server Listesi İndir, CS 2 Server List İndir, CS 2 Server Listesi İndir,CS2 sunucuları, CS2 sunucu listesi, CS2 sunucu tarayıcısı, CS2 sunucusu bulma, Counter-Strike 2 sunucuları, CS2 çok oyunculu sunucular, CS2 rekabetçi sunucular, CS2 topluluk sunucuları, CS2 ping, CS2 haritalar, CS2 oyun modları, CS2 deathmatch sunucuları, CS2 rekabetçi sunucular, CS2 sıradan sunucular, zombie escape sunucuları, bhop sunucuları, surf sunucuları, CS2 retakes sunucuları, CS2 1v1 sunucuları, awp sunucuları, sadece tabanca sunucuları, sadece headshot sunucuları, CS2 mod sunucuları, Avrupa CS2 sunucuları, Amerika CS2 sunucuları, Asya CS2 sunucuları, düşük ping CS2 sunucuları, CS2 sunucu arama, CS2 oyunları, esports sunucuları",
    robots: "index, follow",
    authors: [
        {
            name: "Swiftly Development Team",
            url: "https://swiftlys2.net",
        }
    ],
    openGraph: {
        title: SiteSettings[SITE_VARIANT].name + " - Find " + SiteSettings[SITE_VARIANT].gamename + " servers",
        description: "Discover and join " + SiteSettings[SITE_VARIANT].gamename + " servers worldwide. Browse " + SITE_VARIANT.toUpperCase() + " servers by gamemode, location, ping, and player count. Find the perfect " + SITE_VARIANT.toUpperCase() + " server for competitive matches, casual games, and community servers.",
        url: SiteSettings[SITE_VARIANT].url,
        type: "website",
        siteName: SiteSettings[SITE_VARIANT].name,
    },
    twitter: {
        card: "summary_large_image",
        title: SiteSettings[SITE_VARIANT].name + " - Find " + SiteSettings[SITE_VARIANT].gamename + " servers",
        description: "Discover and join " + SiteSettings[SITE_VARIANT].gamename + " servers worldwide. Browse " + SITE_VARIANT.toUpperCase() + " servers by gamemode, location, ping, and player count. Find the perfect " + SITE_VARIANT.toUpperCase() + " server for competitive matches, casual games, and community servers.",
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
    "name": SiteSettings[SITE_VARIANT].name,
    "description": "Discover and join " + SiteSettings[SITE_VARIANT].gamename + " servers worldwide. Browse " + SITE_VARIANT.toUpperCase() + " servers by gamemode, location, ping, and player count.",
    "url": SiteSettings[SITE_VARIANT].url,
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": SiteSettings[SITE_VARIANT].url + "?serverName={search_term_string}"
        },
        "query-input": "required name=search_term_string"
    },
    "sameAs": [
        SiteSettings[SITE_VARIANT].url + "/discord"
    ],
    "publisher": {
        "@type": "Organization",
        "name": SiteSettings[SITE_VARIANT].name,
        "url": SiteSettings[SITE_VARIANT].url
    },
    "audience": {
        "@type": "Audience",
        "audienceType": "Gamers",
        "geographicArea": "Worldwide"
    },
    "about": {
        "@type": "VideoGame",
        "name": SiteSettings[SITE_VARIANT].gamename,
        "alternateName": SITE_VARIANT.toUpperCase(),
        "genre": "First-person shooter",
        "publisher": {
            "@type": "Organization",
            "name": "Valve Corporation"
        }
    }
}