import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const context = await createContext();
    const caller = appRouter.createCaller(context);

    const filters = await caller.filters.getFilters();

    return NextResponse.json(filters);
}