"use client";

import { ServerAndServerData } from "@/lib/api/data";
import {
    CompressedData,
    COMPRESSED_DATA_VERSION_V1,
} from "./shared";
import { Buffer } from "buffer";

export const DecompressServerList = (compressedData: CompressedData): ServerAndServerData[] => {
    const isV1Payload = compressedData.version === COMPRESSED_DATA_VERSION_V1;

    if (!isV1Payload) {
        throw new Error("Unsupported compressed data version");
    }

    const buffer = Buffer.from(compressedData.data, "base64");
    const serverList: ServerAndServerData[] = [];

    let offset = 0;

    while (offset < buffer.length) {
        const serverIdLength = buffer.readUInt32BE(offset);
        offset += 4;
        const serverId = buffer.toString('utf8', offset, offset + serverIdLength);
        offset += serverIdLength;

        const ip = `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}.${buffer.readUInt8(offset + 3)}`;
        offset += 4;

        const port = buffer.readUInt16BE(offset);
        offset += 2;

        const latitude = buffer.readFloatBE(offset);
        offset += 4;

        const longitude = buffer.readFloatBE(offset);
        offset += 4;

        const country = buffer.toString('utf8', offset, offset + 2);
        offset += 2;

        const botsCount = buffer.readUInt8(offset);
        offset += 1;

        const maxPlayers = buffer.readUInt8(offset);
        offset += 1;

        const playersCount = buffer.readUInt8(offset);
        offset += 1;

        const hostnameLength = buffer.readUInt32BE(offset);
        offset += 4;
        const hostname = buffer.toString('utf8', offset, offset + hostnameLength);
        offset += hostnameLength;

        const mapLength = buffer.readUInt32BE(offset);
        offset += 4;
        const map = buffer.toString('utf8', offset, offset + mapLength);
        offset += mapLength;

        const tagsLength = buffer.readUInt32BE(offset);
        offset += 4;
        const tags = buffer.toString('utf8', offset, offset + tagsLength);
        offset += tagsLength;

        const version = `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}.${buffer.readUInt8(offset + 3)}`;
        offset += 4;

        serverList.push({
            Server: {
                id: serverId,
                address: `${ip}:${port}`,
                latitute: latitude,
                longitude: longitude,
                country: country,
                status: 0,
                lastUpdated: null,
                lastStatusUpdate: null
            },
            ServerData: {
                botsCount: botsCount,
                maxPlayers: maxPlayers,
                playersCount: playersCount,
                hostname: hostname,
                map: map,
                tags: tags,
                serverId: serverId,
                version: version,
                secure: true
            }
        });
    }
    return serverList;
}