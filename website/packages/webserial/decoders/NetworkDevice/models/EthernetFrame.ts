class EthernetFrame {
    static readonly SEPARATOR = ' ';
    readonly timestamp: number;
    readonly id: number;
    readonly dst: string;
    readonly src: string;
    readonly payload: string;

    constructor(ts: number, id: number, dst: string, src: string, payload: string) {
        this.timestamp = ts;
        this.id = id;
        this.dst = dst;
        this.src = src;
        this.payload = payload;
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
