import { action } from 'mobx';
import Decoder from './Decoder';
import IPFrame from './IPFrame';

class Router {
    private interfaces = new Map<string, Decoder>();
    constructor() {}

    addInterface(decoder: Decoder) {
        this.interfaces.set(decoder.id, decoder);
    }

    removeInterface(decoder: Decoder) {
        this.interfaces.delete(decoder.id);
    }

    @action
    routePacket(decoder: Decoder, frame?: IPFrame) {
        if (!decoder || !decoder.binaryIp || !frame || !this.interfaces.has(decoder.id)) {
            return;
        }
        const frameDstIp = frame.dstNetworkPart;
        if (frameDstIp === undefined) {
            return;
        }
        if (decoder.ipNetworkPart === frameDstIp) {
            console.log('Packet is from the same network, ignoring routing');
            // packet is from the same network and should already be switched by the microbit, so we can ignore it
            return;
        }
        const pkg = frame.serialPkg;
        const intrface = [...this.interfaces.values()].find((intf) => intf.ipNetworkPart === frameDstIp);
        if (intrface) {
            return intrface.sendRawPkg(pkg);
        }
        if (decoder.config?.defaultGateway) {
            const gateway = IPFrame.parseIp(decoder.config.defaultGateway);
            if (gateway) {
                const defaultGatewayNetworkPart = gateway & IPFrame.NETWORK_MASK;
                if (decoder.ipNetworkPart === defaultGatewayNetworkPart) {
                    return;
                }
                const intrface = [...this.interfaces.values()].find(
                    (intf) => intf.ipNetworkPart === defaultGatewayNetworkPart
                );
                if (intrface) {
                    return intrface.sendRawPkg(pkg);
                }
            }
        }
    }

    @action
    dispose() {}
}

export default Router;
