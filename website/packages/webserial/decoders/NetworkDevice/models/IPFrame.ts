import { SEND_ROUTING_PKG } from './Decoder';

class IPFrame {
    readonly type: 'ip' = 'ip';
    static readonly SEPARATOR = ' ';
    static readonly NETWORK_MASK = (0xffffffff << 8) & 0xffffffff;
    readonly ttl: number;
    readonly src: string;
    readonly dst: string;
    readonly payload: string;
    readonly srcBinary: number;
    readonly dstBinary: number;

    constructor(ttl: number, src: string, dst: string, payload: string) {
        this.ttl = ttl;
        this.src = src;
        this.dst = dst;
        this.srcBinary = IPFrame.parseIp(src) || 0;
        this.dstBinary = IPFrame.parseIp(dst) || 0;
        this.payload = payload;
    }

    static parse(line: string): IPFrame | null {
        try {
            const [pkgType, ttl, src, dst, ...payloadParts] = line.split(IPFrame.SEPARATOR);
            if (pkgType !== 'IP') {
                return null;
            }
            if (!ttl || !src || !dst) {
                return null;
            }
            if (!IPFrame.isValidIp(src) || !IPFrame.isValidIp(dst)) {
                return null;
            }
            return new IPFrame(Number.parseInt(ttl), src, dst, payloadParts.join(IPFrame.SEPARATOR));
        } catch {
            return null;
        }
    }

    get serialPkg() {
        return [SEND_ROUTING_PKG, this.ttl - 1, this.src, this.dst, this.payload].join(IPFrame.SEPARATOR);
    }

    get srcNetworkPart() {
        return this.srcBinary & IPFrame.NETWORK_MASK;
    }

    get dstNetworkPart() {
        return this.dstBinary & IPFrame.NETWORK_MASK;
    }

    static isValidIp(ip?: string | null): boolean {
        if (!ip) {
            return false;
        }
        const parts = ip.trim().split('.');
        if (parts.length !== 4) {
            return false;
        }
        for (const part of parts) {
            const num = Number(part);
            if (isNaN(num) || num < 0 || num > 255) {
                return false;
            }
        }
        return true;
    }

    static parseIp(ip: string): number | null {
        if (!IPFrame.isValidIp(ip)) {
            return null;
        }
        return ip.split('.').reduce((acc, octet) => (acc << 8) + Number.parseInt(octet), 0);
    }
}

export default IPFrame;
