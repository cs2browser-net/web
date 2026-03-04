import { initTRPC } from "@trpc/server";
import { headers } from "next/headers";
import SuperJSON from "superjson";
import { GetClientIP } from "../utils/ip";

export async function createContext() {
    const h = await headers();
    console.log(h)

    return {
        ip: GetClientIP(h as unknown as Record<string, string>)
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON
})

export const router = t.router;
export const publicProcedure = t.procedure;