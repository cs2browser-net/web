"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { navigationItems } from "./Routes";
import AddServer from "../server/AddServer";

export default function MobileHeader() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                <div className="flex flex-col gap-4 mt-12 overflow-y-auto flex-1 pr-2">
                    <AddServer />

                    <Separator />

                    <div className="flex flex-col gap-2">
                        <Link
                            href="https://github.com/cs2browser-net/web"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            GitHub
                        </Link>
                        <Link
                            href="/donate"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Donate
                        </Link>
                        <Link
                            href="/group"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Group
                        </Link>
                    </div>

                    {Object.entries(navigationItems).map(([key, category]) => (
                        <div key={key} className="flex flex-col gap-2">
                            <Separator />
                            <h3 className="px-3 text-sm font-semibold text-muted-foreground">
                                {category.title}
                            </h3>
                            {category.routes.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${item.iconClassName || ''}`} />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{item.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.description}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
