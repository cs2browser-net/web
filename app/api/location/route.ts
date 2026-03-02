import { GetClientIP, GetLocation } from "@/lib/utils/ip";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const ip = GetClientIP(req.headers as unknown as Record<string, string>);
    const location = GetLocation(ip);

    return NextResponse.json({ lat: location.latitude, lon: location.longitude });
}