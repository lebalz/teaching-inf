import { action } from 'mobx';
import Decoder from './Decoder';
import IPFrame from './IPFrame';
import { configToQueryString } from './DeviceConfig';
import { parseQueryParams } from '../hooks/useRouterConfig';

class Router {
    private interfaces = new Map<string, Decoder>();
    readonly syncQueryString: boolean;
    constructor(syncQueryString: boolean) {
        this.syncQueryString = syncQueryString;
    }

    addInterface(decoder: Decoder) {
        this.interfaces.set(decoder.id, decoder);
        console.log('add', decoder.id, decoder);
        this.updateQueryString();
    }

    removeInterface(decoderId: string) {
        this.interfaces.delete(decoderId);
        this.updateQueryString(decoderId);
    }

    queryString(ignoredDecoderId?: string) {
        const idx2ignore = ignoredDecoderId
            ? Number.parseInt(ignoredDecoderId.replace(/^.*-nic-/, ''), 10) - 1
            : null;
        const current = parseQueryParams(window.location.search).filter(
            (_, idx) => idx2ignore === null || idx !== idx2ignore
        );
        const nics = [...this.interfaces.keys()];

        for (const nic of nics) {
            const intf = this.interfaces.get(nic);
            if (intf?.config) {
                const nicNr = parseInt(nic.replace(/^.*-nic-/, ''), 10);
                const currentIdx = current.findIndex((c) => c.nic === nicNr);
                if (currentIdx !== -1) {
                    current[currentIdx] = {
                        nic: nicNr,
                        ...intf.config
                    };
                } else {
                    current.push({
                        nic: nicNr,
                        ...intf.config
                    });
                }
            }
        }
        const mergedQueryString = current.map((config) => configToQueryString(config).toString()).join('&');
        return mergedQueryString;
    }

    @action
    updateQueryString(ignoredDecoderId?: string) {
        if (!this.syncQueryString) {
            return;
        }
        const mergedQueryString = this.queryString(ignoredDecoderId);
        const newUrl = `${window.location.pathname}?${mergedQueryString}`;
        window.history.replaceState(null, '', newUrl);
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
