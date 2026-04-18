import { ServerAndServerData } from "@/lib/api/data";
import {
    CalculateBufferSize,
    COMPRESSED_DATA_VERSION_V1,
    CompressedData,
} from "./shared";

export const CompressServerList = (serverList: ServerAndServerData[]): CompressedData => {

    const bufferSize = CalculateBufferSize(serverList);
    const buffer = Buffer.alloc(bufferSize);

    let offset = 0;

    for (let i = 0; i < serverList.length; i++) {
        const server = serverList[i];
        const serverIdLength = Buffer.byteLength(server.Server.id, 'utf8');

        buffer.writeUInt32BE(serverIdLength, offset);
        offset += 4;
        buffer.write(server.Server.id, offset, 'utf8');
        offset += serverIdLength;

        const [ip, port] = server.Server.address.split(':');
        const ipParts = ip.split('.').map(part => parseInt(part));
        buffer.writeUInt8(ipParts[0], offset);
        buffer.writeUInt8(ipParts[1], offset + 1);
        buffer.writeUInt8(ipParts[2], offset + 2);
        buffer.writeUInt8(ipParts[3], offset + 3);
        offset += 4;

        buffer.writeUInt16BE(parseInt(port), offset);
        offset += 2;

        buffer.writeFloatBE(server.Server.latitute, offset);
        offset += 4;

        buffer.writeFloatBE(server.Server.longitude, offset);
        offset += 4;

        buffer.write(server.Server.country, offset, 'utf8');
        offset += 2;

        buffer.writeUInt8(server.ServerData.botsCount, offset);
        offset += 1;

        buffer.writeUInt8(server.ServerData.maxPlayers, offset);
        offset += 1;

        buffer.writeUInt8(server.ServerData.playersCount, offset);
        offset += 1;

        const hostnameLength = Buffer.byteLength(server.ServerData.hostname, 'utf8');
        buffer.writeUInt32BE(hostnameLength, offset);
        offset += 4;
        buffer.write(server.ServerData.hostname, offset, 'utf8');
        offset += hostnameLength;

        const mapLength = Buffer.byteLength(server.ServerData.map, 'utf8');
        buffer.writeUInt32BE(mapLength, offset);
        offset += 4;
        buffer.write(server.ServerData.map, offset, 'utf8');
        offset += mapLength;

        const tagsLength = Buffer.byteLength(server.ServerData.tags, 'utf8');
        buffer.writeUInt32BE(tagsLength, offset);
        offset += 4;
        buffer.write(server.ServerData.tags, offset, 'utf8');
        offset += tagsLength;

        const versionParts = server.ServerData.version.split('.').map(part => parseInt(part));
        buffer.writeUInt8(versionParts[0], offset);
        buffer.writeUInt8(versionParts[1], offset + 1);
        buffer.writeUInt8(versionParts[2], offset + 2);
        buffer.writeUInt8(versionParts[3], offset + 3);
        offset += 4;
    }

    return {
        version: COMPRESSED_DATA_VERSION_V1,
        data: buffer.toString('base64')
    }
}