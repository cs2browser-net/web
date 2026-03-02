import { pingCache } from "@/lib/cache/ping-cache";

export const EstimatePing = (serverLat: number, serverLon: number, userLat?: number, userLon?: number): number => {
    if (!userLat || !userLon) return 999;

    const cachedPing = pingCache.get(serverLat, serverLon, userLat, userLon);
    if (cachedPing !== undefined) {
        return cachedPing;
    }

    const R = 6371e3;
    const a1 = serverLat * Math.PI / 180;
    const a2 = userLat * Math.PI / 180;
    const dt = (userLat - serverLat) * Math.PI / 180;
    const da = (userLon - serverLon) * Math.PI / 180;

    const a = Math.sin(dt / 2) * Math.sin(dt / 2) +
        Math.cos(a1) * Math.cos(a2) *
        Math.sin(da / 2) * Math.sin(da / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInMeters = R * c;
    const ping = Math.floor(((1.92 * (distanceInMeters / 1000)) / 100));

    pingCache.set(serverLat, serverLon, userLat, userLon, ping);

    return ping;
};
