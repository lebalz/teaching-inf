import ARP from './ARP';
import IPFrame from './IPFrame';

class EthernetFrame {
    readonly type: 'ethernet' = 'ethernet';
    static readonly SEPARATOR = ' ';
    readonly timestamp: number;
    readonly id: number;
    readonly dst: string;
    readonly src: string;
    readonly payload: string;
    readonly ipFrame?: IPFrame;
    readonly arpFrame?: ARP;

    constructor(ts: number, id: number, dst: string, src: string, payload: string) {
        this.timestamp = ts;
        this.id = id;
        this.dst = dst;
        this.src = src;
        this.payload = payload;
        const ipPkg = IPFrame.parse(this.payload);
        if (ipPkg) {
            this.ipFrame = ipPkg;
        }
        const arpPkg = ARP.parse(this.payload);
        if (arpPkg) {
            this.arpFrame = arpPkg;
        }
    }

    get ethernetString() {
        return `${this.dst}    ${this.src}    ${this.payload}`;
    }

    static parse(line: string): EthernetFrame | null {
        try {
            const [ts, id, dst, src, ...payloadParts] = line.split(EthernetFrame.SEPARATOR);
            if (!ts || !id || !dst || !src) {
                return null;
            }
            return new EthernetFrame(
                Number.parseInt(ts),
                Number.parseInt(id),
                dst,
                src,
                payloadParts.join(EthernetFrame.SEPARATOR)
            );
        } catch {
            return null;
        }
    }
}

export default EthernetFrame;
