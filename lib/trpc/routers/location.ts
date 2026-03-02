import { publicProcedure, router } from "@/lib/trpc/trpc";
import { GetLocation } from "@/lib/utils/ip";

export const locationRouter = router({
    getInfo: publicProcedure.query((data) => {
        return GetLocation(data.ctx.ip)
    })
});
