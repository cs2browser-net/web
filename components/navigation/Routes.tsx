"use client";

import { SITE_VARIANT } from "@/lib/consts/settings";
import { BarChart3, Code, Eye, Globe, Heart, HelpCircle, List, LucideProps, Users } from "lucide-react";

interface Route {
    title: string;
    href: string;
    description: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    iconClassName?: string;
}

interface Category {
    title: string;
    routes: Route[];
}

export const navigationItems: Record<string, Category> = {
    browse: {
        title: "Browse",
        routes: [
            {
                title: "Explore Servers",
                href: "/",
                description: "Browse all available " + SITE_VARIANT.toUpperCase() + " servers",
                icon: Globe
            },
            {
                title: "Favorites",
                href: "/favorites",
                description: "Your saved favorite servers",
                icon: Heart
            },
            {
                title: "Hidden Servers",
                href: "/hidden-servers",
                description: "Manage your hidden server list",
                icon: Eye
            }
        ]
    },
    resources: {
        title: "Resources",
        routes: [
            {
                title: "Metrics",
                href: "/metrics",
                description: "View server checking and processing metrics",
                icon: BarChart3
            },
            {
                title: "API Documentation",
                href: "/api-docs",
                description: "Developer API reference and guides",
                icon: Code
            },
            {
                title: "Changelog",
                href: "/changelog",
                description: "Latest updates and improvements",
                icon: List
            }
        ]
    },
    support: {
        title: "Support",
        routes: [
            {
                title: "Contact",
                href: "/contact",
                description: "Get help and support",
                icon: HelpCircle
            },
            {
                title: "Discord",
                href: "/discord",
                description: "Join our community server",
                icon: Users
            }
        ]
    }
};