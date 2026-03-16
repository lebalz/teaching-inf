class IPFrame {
    static readonly SEPARATOR = ' ';
    readonly ttl: number;
    readonly src: string;
    readonly dst: string;
    readonly payload: string;

    constructor(ttl: number, src: string, dst: string, payload: string) {
        this.ttl = ttl;
        this.src = src;
        this.dst = dst;
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
            return new IPFrame(Number.parseInt(ttl), src, dst, payloadParts.join(IPFrame.SEPARATOR));
        } catch {
            return null;
        }
    }
}

export default IPFrame;
