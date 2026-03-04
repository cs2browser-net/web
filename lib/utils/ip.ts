import { mmdbv4, mmdbv6 } from "../location/maxmind";
import { Location } from "../location/store";

export function GetClientIP(headers: Record<string, string>) {
    const ip =
        (headers["cf-connecting-ip"] as string) ||
        (headers["x-forwarded-for"] as string)?.split(",")[0] ||
        headers["x-real-ip"] ||
        "127.0.0.1";

    if (ip == "127.0.0.1" || ip == "::1") {
        return "0.0.0.0";
    }

    return ip;
}

export function GetLocation(ip: string): Location {
    if (ip.includes(":")) {
        const info = mmdbv6.get(ip)
        // @ts-expect-error wrong info
        return { latitude: info?.latitude || 0.0, longitude: info?.longitude || 0.0 }
    } else {
        const info = mmdbv4.get(ip)
        // @ts-expect-error wrong info
        return { latitude: info?.latitude || 0.0, longitude: info?.longitude || 0.0 }
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