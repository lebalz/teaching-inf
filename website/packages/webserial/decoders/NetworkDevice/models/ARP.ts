class ARP {
    readonly type: 'arp' = 'arp';
    static readonly SEPARATOR = ' ';
    readonly sender_mac: string;
    readonly sender_ip: string;
    readonly dest_ip: string;

    constructor(sender_mac: string, sender_ip: string, dest_ip: string) {
        this.sender_mac = sender_mac;
        this.sender_ip = sender_ip;
        this.dest_ip = dest_ip;
    }

    static parse(line: string): ARP | null {
        try {
            const [pkgType, sender_mac, sender_ip, dest_ip, ...rest] = line.split(ARP.SEPARATOR);
            if (pkgType !== 'ARP') {
                return null;
            }
            if (!sender_mac || !sender_ip || !dest_ip) {
                return null;
            }
            return new ARP(sender_mac, sender_ip, dest_ip);
        } catch {
            return null;
        }
    }
}

export default ARP;
