import { LookupGeoIpCity } from "@/lib/location/geoip-service";
import { Location } from "../location/store";

export function GetClientIP(headers: Headers) {
    const ip =
        (headers.get("cf-connecting-ip") as string) ||
        (headers.get("x-forwarded-for") as string)?.split(",")[0] ||
        headers.get("x-real-ip") ||
        "127.0.0.1";

    if (ip == "127.0.0.1" || ip == "::1") {
        return "0.0.0.0";
    }

    return ip;
}

export async function GetLocation(ip: string): Promise<Location> {
    try {
        const info = await LookupGeoIpCity(ip);

        if (!info) {
            return { latitude: 0.0, longitude: 0.0, countryCode: "ro" };
        }

        return {
            latitude: info.latitude ?? 0.0,
            longitude: info.longitude ?? 0.0,
            countryCode: info.countryCode?.toLowerCase() ?? "ro",
        };
    } catch {
        return { latitude: 0.0, longitude: 0.0, countryCode: "ro" };
    }
}

export function IpToInt(ip: string): number {
    return ip.split('.').reduce((acc, octet) => {
        return (acc << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
}

export function IsIpInSubnet(ip: string, cidr: string): boolean {
    const [subnet, prefixLengthStr] = cidr.split('/');
    const prefixLength = parseInt(prefixLengthStr, 10);

    if (prefixLength < 0 || prefixLength > 32) {
        throw new Error('Invalid CIDR prefix length');
    }

    const ipInt = IpToInt(ip);
    const subnetInt = IpToInt(subnet);

    const mask = prefixLength === 0
        ? 0
        : (~0 << (32 - prefixLength)) >>> 0;

    return (ipInt & mask) === (subnetInt & mask);
}