import "server-only";
import net, { Socket } from "node:net";

const QUERY_CITY = 1;

const STATUS_OK = 0;
const STATUS_BAD_REQUEST = 1;
const STATUS_NOT_FOUND = 2;
const STATUS_UNAVAILABLE = 3;
const STATUS_INTERNAL = 4;

const MAX_FRAME_SIZE = 16 * 1024 * 1024;

const DEFAULT_GEOIP_HOST = "127.0.0.1";
const DEFAULT_GEOIP_PORT = 8081;
const DEFAULT_GEOIP_TIMEOUT_MS = 5_000;
const DEFAULT_GEOIP_POOL_SIZE = 6;

interface GeoIpPoolConfig {
    host: string;
    port: number;
    timeoutMs: number;
    poolSize: number;
}

interface ResponseFrame {
    status: number;
    payload: Buffer;
}

interface PendingRequest {
    resolve: (response: ResponseFrame) => void;
    reject: (error: Error) => void;
    timeoutHandle: NodeJS.Timeout;
}

interface GeoIpCityPayload {
    countryCode?: string;
    state1?: string;
    state2?: string;
    city?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
}

class ByteCursor {
    private offset = 0;

    constructor(private readonly bytes: Buffer) {
    }

    ensureConsumed(): void {
        if (this.offset !== this.bytes.length) {
            throw new Error(`Unexpected trailing bytes: ${this.bytes.length - this.offset}`);
        }
    }

    readU8(): number {
        return this.readBytes(1).readUInt8(0);
    }

    readU16(): number {
        return this.readBytes(2).readUInt16BE(0);
    }

    readU32(): number {
        return this.readBytes(4).readUInt32BE(0);
    }

    readF64(): number {
        return this.readBytes(8).readDoubleBE(0);
    }

    readString(): string {
        const strLen = this.readU16();
        const strBytes = this.readBytes(strLen);

        return strBytes.toString("utf8");
    }

    readOptionalString(): string | undefined {
        const presence = this.readU8();

        if (presence === 0) return undefined;
        if (presence === 1) return this.readString();

        throw new Error(`Invalid optional string presence flag: ${presence}`);
    }

    readOptionalF64(): number | undefined {
        const presence = this.readU8();

        if (presence === 0) return undefined;
        if (presence === 1) return this.readF64();

        throw new Error(`Invalid optional f64 presence flag: ${presence}`);
    }

    private readBytes(length: number): Buffer {
        const end = this.offset + length;

        if (end > this.bytes.length) {
            throw new Error(
                `Unexpected end of payload: need ${length} more byte(s), have ${this.bytes.length - this.offset}`,
            );
        }

        const chunk = this.bytes.subarray(this.offset, end);
        this.offset = end;
        return chunk;
    }
}

class GeoIpConnection {
    private socket: Socket | null = null;
    private connectPromise: Promise<void> | null = null;
    private queue: Promise<unknown> = Promise.resolve();
    private pendingRequest: PendingRequest | null = null;
    private readBuffer: Buffer = Buffer.alloc(0);

    constructor(private readonly config: GeoIpPoolConfig) {
    }

    send<T>(request: Buffer, decode: (frame: ResponseFrame) => T): Promise<T> {
        const operation = this.queue.then(async () => {
            await this.ensureConnected();

            const response = await this.sendFrame(request);
            return decode(response);
        });

        this.queue = operation.then(
            () => undefined,
            () => undefined,
        );

        return operation;
    }

    private async ensureConnected(): Promise<void> {
        if (this.socket && !this.socket.destroyed) {
            return;
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = new Promise<void>((resolve, reject) => {
            const socket = net.createConnection({
                host: this.config.host,
                port: this.config.port,
            });

            const connectTimer = setTimeout(() => {
                socket.removeListener("connect", handleConnect);
                socket.removeListener("error", handleInitialError);
                socket.destroy();
                reject(new Error(`Timed out while connecting to geoip service at ${this.config.host}:${this.config.port}`));
            }, this.config.timeoutMs);

            const handleConnect = () => {
                clearTimeout(connectTimer);
                socket.removeListener("error", handleInitialError);

                socket.setNoDelay(true);
                socket.setKeepAlive(true);
                socket.on("data", this.handleData);
                socket.on("error", this.handleSocketError);
                socket.on("close", this.handleSocketClose);

                this.socket = socket;
                this.readBuffer = Buffer.alloc(0);

                resolve();
            };

            const handleInitialError = (error: Error) => {
                clearTimeout(connectTimer);
                socket.removeListener("connect", handleConnect);
                reject(new Error(`Failed to connect to geoip service at ${this.config.host}:${this.config.port}: ${error.message}`));
            };

            socket.once("connect", handleConnect);
            socket.once("error", handleInitialError);
        }).finally(() => {
            this.connectPromise = null;
        });

        return this.connectPromise;
    }

    private sendFrame(request: Buffer): Promise<ResponseFrame> {
        const socket = this.socket;

        if (!socket || socket.destroyed) {
            throw new Error("Geoip connection is not available");
        }

        if (this.pendingRequest) {
            throw new Error("Geoip connection is busy");
        }

        return new Promise<ResponseFrame>((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.rejectPending(new Error("Geoip request timed out"));
                this.resetSocket();
            }, this.config.timeoutMs);

            this.pendingRequest = {
                resolve,
                reject,
                timeoutHandle,
            };

            socket.write(request, (error) => {
                if (!error) {
                    return;
                }

                this.rejectPending(new Error(`Failed to write geoip request: ${error.message}`));
                this.resetSocket();
            });
        });
    }

    private handleData = (chunk: Buffer): void => {
        this.readBuffer = this.readBuffer.length === 0
            ? chunk
            : Buffer.concat([this.readBuffer, chunk]);

        this.tryResolvePending();
    };

    private tryResolvePending(): void {
        if (!this.pendingRequest || this.readBuffer.length < 5) {
            return;
        }

        const status = this.readBuffer.readUInt8(0);
        const payloadLength = this.readBuffer.readUInt32BE(1);

        if (payloadLength > MAX_FRAME_SIZE) {
            this.rejectPending(new Error(`Geoip payload too large: ${payloadLength} bytes`));
            this.resetSocket();
            return;
        }

        const frameLength = 5 + payloadLength;
        if (this.readBuffer.length < frameLength) {
            return;
        }

        const payload = this.readBuffer.subarray(5, frameLength);
        this.readBuffer = this.readBuffer.subarray(frameLength);

        this.resolvePending({
            status,
            payload: Buffer.from(payload),
        });
    }

    private handleSocketError = (error: Error): void => {
        this.rejectPending(new Error(`Geoip socket error: ${error.message}`));
        this.resetSocket();
    };

    private handleSocketClose = (): void => {
        this.rejectPending(new Error("Geoip socket closed"));
        this.resetSocket();
    };

    private resolvePending(response: ResponseFrame): void {
        if (!this.pendingRequest) {
            return;
        }

        const pending = this.pendingRequest;
        this.pendingRequest = null;
        clearTimeout(pending.timeoutHandle);

        pending.resolve(response);
    }

    private rejectPending(error: Error): void {
        if (!this.pendingRequest) {
            return;
        }

        const pending = this.pendingRequest;
        this.pendingRequest = null;
        clearTimeout(pending.timeoutHandle);

        pending.reject(error);
    }

    private resetSocket(): void {
        if (!this.socket) {
            this.readBuffer = Buffer.alloc(0);
            return;
        }

        this.socket.removeListener("data", this.handleData);
        this.socket.removeListener("error", this.handleSocketError);
        this.socket.removeListener("close", this.handleSocketClose);

        if (!this.socket.destroyed) {
            this.socket.destroy();
        }

        this.socket = null;
        this.readBuffer = Buffer.alloc(0);
    }
}

class GeoIpPool {
    private readonly connections: GeoIpConnection[];
    private index = 0;

    constructor(private readonly config: GeoIpPoolConfig) {
        this.connections = Array.from(
            { length: config.poolSize },
            () => new GeoIpConnection(config),
        );
    }

    lookupCity(ip: string): Promise<GeoIpCityPayload | null> {
        const request = buildSingleRequest(QUERY_CITY, ip);
        const connection = this.connections[this.index];
        this.index = (this.index + 1) % this.connections.length;

        return connection.send(request, (response) => decodeCityResponse(response));
    }
}

function parseEnvInt(name: string, fallback: number, minimum: number, maximum: number): number {
    const rawValue = process.env[name];

    if (!rawValue) {
        return fallback;
    }

    const value = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(value) || value < minimum || value > maximum) {
        return fallback;
    }

    return value;
}

function getGeoIpConfig(): GeoIpPoolConfig {
    return {
        host: process.env.GEOIP_SERVICE_HOST ?? DEFAULT_GEOIP_HOST,
        port: parseEnvInt("GEOIP_SERVICE_PORT", DEFAULT_GEOIP_PORT, 1, 65535),
        timeoutMs: parseEnvInt("GEOIP_SERVICE_TIMEOUT_MS", DEFAULT_GEOIP_TIMEOUT_MS, 100, 120000),
        poolSize: parseEnvInt("GEOIP_SERVICE_POOL_SIZE", DEFAULT_GEOIP_POOL_SIZE, 1, 128),
    };
}

function buildSingleRequest(queryByte: number, ip: string): Buffer {
    const ipBytes = Buffer.from(ip, "utf8");

    if (ipBytes.length === 0) {
        throw new Error("Geoip query IP cannot be empty");
    }

    if (ipBytes.length > 255) {
        throw new Error(`Geoip query IP is too long for protocol (max 255 bytes): ${ip}`);
    }

    return Buffer.concat([
        Buffer.from([queryByte, ipBytes.length]),
        ipBytes,
    ]);
}

function decodeCityResponse(response: ResponseFrame): GeoIpCityPayload | null {
    if (response.status === STATUS_NOT_FOUND) {
        return null;
    }

    if (response.status !== STATUS_OK) {
        const errorPayload = decodeErrorPayload(response.payload);
        throw new Error(`Geoip city lookup failed (${statusLabel(response.status)}): ${errorPayload}`);
    }

    const cursor = new ByteCursor(response.payload);
    const cityPayload: GeoIpCityPayload = {
        countryCode: cursor.readOptionalString(),
        state1: cursor.readOptionalString(),
        state2: cursor.readOptionalString(),
        city: cursor.readOptionalString(),
        postcode: cursor.readOptionalString(),
        latitude: cursor.readOptionalF64(),
        longitude: cursor.readOptionalF64(),
        timezone: cursor.readOptionalString(),
    };

    cursor.ensureConsumed();
    return cityPayload;
}

function decodeErrorPayload(payload: Buffer): string {
    try {
        const cursor = new ByteCursor(payload);
        const message = cursor.readString();
        cursor.ensureConsumed();
        return message;
    } catch {
        return toHex(payload);
    }
}

function statusLabel(status: number): string {
    switch (status) {
        case STATUS_OK:
            return "ok";
        case STATUS_BAD_REQUEST:
            return "bad_request";
        case STATUS_NOT_FOUND:
            return "not_found";
        case STATUS_UNAVAILABLE:
            return "unavailable";
        case STATUS_INTERNAL:
            return "internal_error";
        default:
            return "unknown";
    }
}

function toHex(payload: Buffer): string {
    if (payload.length === 0) {
        return "<empty>";
    }

    return Array.from(payload)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("-");
}

declare global {
    var _geoIpPool: GeoIpPool | undefined;
}

const geoIpPool = global._geoIpPool ?? new GeoIpPool(getGeoIpConfig());

if (!global._geoIpPool) {
    global._geoIpPool = geoIpPool;
}

export async function LookupGeoIpCity(ip: string): Promise<GeoIpCityPayload | null> {
    return geoIpPool.lookupCity(ip);
}
