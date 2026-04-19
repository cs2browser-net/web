"use client";

import { ServerAndServerData } from "@/lib/api/data";
import {
    CompressedData,
    COMPRESSED_DATA_VERSION_V1,
} from "./shared";

const Base64ToArrayBuffer = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}

export const DecompressServerList = (compressedData: CompressedData): ServerAndServerData[] => {
    const isV1Payload = compressedData.version === COMPRESSED_DATA_VERSION_V1;

    if (!isV1Payload) {
        throw new Error("Unsupported compressed data version");
    }

    const rawBuffer = Base64ToArrayBuffer(compressedData.data);
    const dataView = new DataView(rawBuffer);
    const bytes = new Uint8Array(rawBuffer);
    const textDecoder = new TextDecoder("utf-8");
    const serverList: ServerAndServerData[] = [];

    let offset = 0;

    const readUtf8 = (length: number) => {
        const value = textDecoder.decode(bytes.subarray(offset, offset + length));
        offset += length;
        return value;
    };

    while (offset < dataView.byteLength) {
        const serverIdLength = dataView.getUint32(offset, false);
        offset += 4;
        const serverId = readUtf8(serverIdLength);

        const ipPart1 = dataView.getUint8(offset);
        const ipPart2 = dataView.getUint8(offset + 1);
        const ipPart3 = dataView.getUint8(offset + 2);
        const ipPart4 = dataView.getUint8(offset + 3);
        const ip = `${ipPart1}.${ipPart2}.${ipPart3}.${ipPart4}`;
        offset += 4;

        const port = dataView.getUint16(offset, false);
        offset += 2;

        const latitude = dataView.getFloat32(offset, false);
        offset += 4;

        const longitude = dataView.getFloat32(offset, false);
        offset += 4;

        const country = readUtf8(2);

        const botsCount = dataView.getUint8(offset);
        offset += 1;

        const maxPlayers = dataView.getUint8(offset);
        offset += 1;

        const playersCount = dataView.getUint8(offset);
        offset += 1;

        const hostnameLength = dataView.getUint32(offset, false);
        offset += 4;
        const hostname = readUtf8(hostnameLength);

        const mapLength = dataView.getUint32(offset, false);
        offset += 4;
        const map = readUtf8(mapLength);

        const tagsLength = dataView.getUint32(offset, false);
        offset += 4;
        const tags = readUtf8(tagsLength);

        const versionMajor = dataView.getUint8(offset);
        const versionMinor = dataView.getUint8(offset + 1);
        const versionPatch = dataView.getUint8(offset + 2);
        const versionBuild = dataView.getUint8(offset + 3);
        const version = `${versionMajor}.${versionMinor}.${versionPatch}.${versionBuild}`;
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