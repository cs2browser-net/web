import { ServerAndServerData } from "@/lib/api/data";

export const COMPRESSED_DATA_VERSION_V1 = "cs2browser-compressed-v1" as const;

export type CompressedDataVersion =
    | typeof COMPRESSED_DATA_VERSION_V1;

export interface CompressedData {
    version: CompressedDataVersion;
    data: string;
}

export const CalculateBufferSize = (data: ServerAndServerData[]): number => {
    var size = 0;

    for (let i = 0; i < data.length; i++) {
        const server = data[i];

        size += Buffer.byteLength(server.Server.id, 'utf8') + 4; // 4 bytes for the length of the string
        size += 6; // Address
        size += 4; // latitude
        size += 4; // longitude
        size += 2; // country code

        size += 1; // bots count
        size += 1; // max players
        size += 1; // players count
        size += Buffer.byteLength(server.ServerData.hostname, 'utf8') + 4; // hostname
        size += Buffer.byteLength(server.ServerData.map, 'utf8') + 4; // map
        size += Buffer.byteLength(server.ServerData.tags, 'utf8') + 4; // tags
        size += 4; // version
    }

    return size;
}