class Message {
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

    static parse(line: string): Message | null {
        const [ttl, src, dst, ...payloadParts] = line.split(Message.SEPARATOR);
        if (!ttl || !src || !dst) {
            return null;
        }
        return new Message(Number(ttl), src, dst, payloadParts.join(Message.SEPARATOR));
    }
}

export default Message;
