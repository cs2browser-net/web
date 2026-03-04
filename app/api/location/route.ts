import { GetClientIP, GetLocation } from "@/lib/utils/ip";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const ip = GetClientIP(req.headers);
    const location = GetLocation(ip);

    return NextResponse.json({ lat: location.latitude, lon: location.longitude });
}