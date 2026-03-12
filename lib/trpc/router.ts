import { router } from "./trpc";
import { serversRouter } from "./routers/servers";
import { locationRouter } from './routers/location'
import { filtersRouter } from "./routers/filters";
import { metricsRouter } from "./routers/metrics";
import { tasksRouter } from "./routers/tasks";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
    servers: serversRouter,
    location: locationRouter,
    filters: filtersRouter,
    metrics: metricsRouter,
    tasks: tasksRouter,
    admin: adminRouter
});

export type AppRouter = typeof appRouter;