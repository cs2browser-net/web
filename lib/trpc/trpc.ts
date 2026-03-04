import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { GetClientIP } from "../utils/ip";

export async function createContext({ req }: { req: Request }) {
    return {
        ip: GetClientIP(req.headers as unknown as Record<string, string>)
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON
})

export const router = t.router;
export const publicProcedure = t.procedure;