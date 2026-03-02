"use client";

import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "./navigation-menu";
import { forwardRef } from "react";

export const ListItem = forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
        title: string;
        icon?: React.ElementType;
        iconClassName?: string;
    }
>(({ className, title, children, icon: Icon, iconClassName, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none flex items-center">
                        {Icon && <Icon className={cn("h-4 w-4 mr-2", iconClassName)} />}
                        {title}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
});
ListItem.displayName = "ListItem";