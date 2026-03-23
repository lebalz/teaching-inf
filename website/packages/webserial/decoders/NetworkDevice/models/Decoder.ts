import SerialDevice, { ConnectionState, iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, computed, observable } from 'mobx';
import DeviceConfig, { Config } from './DeviceConfig';
import EthernetFrame from './EthernetFrame';
import Router from './Router';
import IPFrame from './IPFrame';

const CONFIG = '::CONFIG::';
export const SEND_L2 = '::L2::';
export const SEND_L3 = '::L3::';
export const SEND_ROUTING_PKG = '::R::';
const isValidMac = (mac?: string) => {
    if (!mac) {
        return false;
    }
    const parts = mac.trim().split(':');
    if (parts.length !== 6) {
        return false;
    }
    for (const part of parts) {
        if (!/^[0-9a-fA-F]{2}$/.test(part)) {
            return false;
        }
    }
    return true;
};

const DEFAULT_CONFIG: DeviceConfig = new DeviceConfig(
    'ff:ff:ff:ff:ff:ff',
    'client',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
);

class Decoder implements iSubscriber {
    readonly id: string;
    readonly device: SerialDevice;
    readonly syncQueryString: boolean;
    @observable.ref accessor router: Router | null;
    @observable.ref accessor _defaultConfig: Config | null = null;
    @observable.ref accessor config: DeviceConfig | null = null;
    @observable accessor message: string = '';
    @observable accessor receiverIp: string = '';
    @observable accessor receiverMac: string = '';
    @observable accessor error: string = '';
    @observable accessor flashingStartetAt: number = -1;

    // just the input field for the IP, not necessarily the actual device IP (which is in config)
    @observable accessor deviceIp: string = '';

    packages = observable.array<EthernetFrame>([], { deep: false });

    constructor(
        id: string,
        device: SerialDevice,
        defaultConfig?: Config,
        syncQueryString: boolean = false,
        router?: Router
    ) {
        this.id = id;
        this.device = device;
        this.device.subscribe(this);
        this._defaultConfig = defaultConfig || null;
        this.syncQueryString = syncQueryString;
        this.router = router || null;
        if (router) {
            router.addInterface(this);
        }
    }

    @action
    setDeviceIp(ip: string) {
        this.deviceIp = ip;
    }

    @computed
    get isValidDeviceIp() {
        return IPFrame.isValidIp(this.deviceIp);
    }

    flashDeviceIp() {
        if (this.config) {
            const newConfig = this.config.updateWith({
                ip: this.isValidDeviceIp ? this.deviceIp : null
            });
            this.flashConfig(newConfig);
        }
    }

    flashConfig(config: DeviceConfig) {
        this.device.sendLine(`${CONFIG} ${config.configString}`);
    }

    @action
    setMessage(message: string) {
        this.message = message;
    }

    @action
    setReceiverMac(mac: string) {
        this.receiverMac = mac.toUpperCase().trim();
    }

    @computed
    get isValidReceiverMac() {
        return isValidMac(this.receiverMac);
    }

    @computed
    get showIP() {
        return this.config?.mode !== 'switch';
    }

    @computed
    get binaryIp() {
        if (!this.config?.ip) {
            return null;
        }
        return IPFrame.parseIp(this.config.ip);
    }

    @computed
    get ipNetworkPart() {
        if (!this.binaryIp) {
            return null;
        }
        return this.binaryIp & IPFrame.NETWORK_MASK;
    }

    @action
    setReceiverIp(ip: string) {
        if (!this.config?.ip) {
            return;
        }
        this.receiverIp = ip.trim();
    }

    @computed
    get isValidReceiverIp() {
        return IPFrame.isValidIp(this.receiverIp);
    }

    @computed
    get canSendL2() {
        return this.message.length > 0 && this.isValidReceiverMac;
    }

    @computed
    get canSendL3() {
        return this.message.length > 0 && this.isValidReceiverIp;
    }

    @action
    sendRawPkg(pkg: string) {
        console.log('Sending raw pkg to device', { pkg }, 'from', this.config?.ip);
        this.device.sendLine(pkg);
    }

    @action
    send_L2() {
        if (this.canSendL2) {
            this.device.sendLine(`${SEND_L2} ${this.receiverMac} ${this.message}`);
            // this.message = '';
        }
    }

    @action
    send_L3() {
        if (this.canSendL3) {
            this.device.sendLine(`${SEND_L3} ${this.receiverIp} ${this.message}`);
            // this.message = '';
        }
    }

    @action
    onConnectionStateChange(state: ConnectionState) {
        if (state === 'connected') {
            this.device.sendLine(CONFIG);
        } else {
            this.config = null;
            this.packages.clear();
        }
    }

    @computed
    get isFlashingConfig() {
        return this.flashingStartetAt > 0;
    }

    @action
    clearError() {
        this.error = '';
    }

    _updateQueryString() {
        if (!this.syncQueryString || !this.config) {
            return;
        }
        const newUrl = `${window.location.pathname}?${this.config.queryString}`;
        window.history.replaceState(null, '', newUrl);
    }

    @action
    onNewLines(lines: string[]) {
        for (const line of lines) {
            if (line.startsWith('ERROR:')) {
                this.error = line;
                continue;
            }
            const configPkg = DeviceConfig.parse(line);
            if (!configPkg && this.flashingStartetAt > 0) {
                if (this.flashingStartetAt + 1000 < Date.now()) {
                    this.error = 'Konfiguration fehlgeschlagen - automatisch erneut ausgeführt.';
                    this.resetConfig();
                }
                return;
            }
            if (!configPkg) {
                const ethernetPkg = EthernetFrame.parse(line);
                if (ethernetPkg) {
                    this.packages.push(ethernetPkg);
                    if (ethernetPkg.ipFrame && this.router) {
                        this.router.routePacket(this, ethernetPkg.ipFrame);
                    }
                    return;
                }
            }
            const hadConfig = !!this.config;
            if (configPkg) {
                this.config = configPkg;
                this.flashingStartetAt = -1;
                if (this.error && this.error.startsWith('Konfiguration fehlgeschlagen')) {
                    this.error = '';
                }
                this._updateQueryString();
                this.deviceIp = '';
            }
            if (!hadConfig && this._defaultConfig) {
                if (this.config) {
                    const updated = this.config.updateWith(this._defaultConfig);
                    this.flashConfig(updated);
                } else {
                    const newConfig = DEFAULT_CONFIG.updateWith(this._defaultConfig);
                    this.flashConfig(newConfig);
                }
            }
        }
    }

    @action
    resetConfig() {
        this.flashingStartetAt = Date.now();
        if (!this._defaultConfig) {
            this.device.sendLine(CONFIG);
            return;
        }
        if (this.config) {
            const { ip, ...rest } = this._defaultConfig;
            const updated = this.config.updateWith({
                ...rest,
                ip: this.showIP ? (this.config.ip ?? ip) : null
            });
            this.flashConfig(updated);
        } else {
            const newConfig = DEFAULT_CONFIG.updateWith(this._defaultConfig);
            this.flashConfig(newConfig);
        }
    }

    @action
    reset() {
        this.packages.clear();
    }

    @action
    cleanup() {
        this.device.unsubscribe(this.id);
        this.router?.removeInterface(this);
    }

    @action
    nextMode() {
        if (this.config) {
            const idx = [...DeviceConfig.MODES].indexOf(this.config.mode);
            const nextIdx = (idx + 1) % DeviceConfig.MODES.length;
            const newConfig = this.config.updateWith({ mode: DeviceConfig.MODES[nextIdx] });
            this.flashConfig(newConfig);
        }
    }
}

export default Decoder;
