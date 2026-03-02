"use client";

import Link from "next/link";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import { navigationItems } from "./Routes";
import { ListItem } from "../ui/list-item";
import AddServer from "../server/AddServer";

export default function DesktopHeader() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <AddServer />
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="https://github.com/cs2browser-net/web">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            GitHub
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/donate">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Donate
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/group">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Group
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                {Object.entries(navigationItems).map(([key, category]) => (
                    <NavigationMenuItem key={key}>
                        <NavigationMenuTrigger>{category.title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[300px] gap-3 p-4 md:w-[350px] md:grid-cols-1 lg:w-[400px]">
                                {category.routes.map((item) => (
                                    <ListItem
                                        key={item.href}
                                        title={item.title}
                                        href={item.href}
                                        icon={item.icon}
                                        iconClassName={item.iconClassName}
                                    >
                                        {item.description}
                                    </ListItem>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}