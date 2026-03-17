import SerialDevice, { ConnectionState, iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, computed, observable } from 'mobx';
import DeviceConfig, { Config } from './DeviceConfig';
import EthernetFrame from './EthernetFrame';
import { rest } from 'es-toolkit';

const CONFIG = '::CONFIG::';
const SEND_L2 = '::L2::';
const SEND_L3 = '::L3::';

const isValidIp = (ip?: string) => {
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
};

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
    @observable.ref accessor _defaultConfig: Config | null = null;
    @observable.ref accessor config: DeviceConfig | null = null;
    @observable accessor message: string = '';
    @observable accessor receiverIp: string = '';
    @observable accessor receiverMac: string = '';
    @observable accessor error: string = '';

    // just the input field for the IP, not necessarily the actual device IP (which is in config)
    @observable accessor deviceIp: string = '';

    packages = observable.array<EthernetFrame>([], { deep: false });

    constructor(id: string, device: SerialDevice, defaultConfig?: Config) {
        this.id = id;
        this.device = device;
        this.device.subscribe(this);
        this._defaultConfig = defaultConfig || null;
    }

    @action
    setDeviceIp(ip: string) {
        this.deviceIp = ip;
    }

    @computed
    get isValidDeviceIp() {
        return isValidIp(this.deviceIp);
    }

    flashDeviceIp() {
        if (this.config) {
            const newConfig = this.config.updateWith({
                ip: this.isValidDeviceIp ? this.deviceIp : null
            });
            console.log('Flashing new config with IP', newConfig);
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
    get canSetIP() {
        return this.config?.ip !== null && this.config?.mode !== 'switch';
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
        return isValidIp(this.receiverIp);
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

    @action
    clearError() {
        this.error = '';
    }

    @action
    onNewLines(lines: string[]) {
        for (const line of lines) {
            if (line.startsWith('ERROR:')) {
                this.error = line;
                continue;
            }
            const configPkg = DeviceConfig.parse(line);
            if (!configPkg) {
                const ethernetPkg = EthernetFrame.parse(line);
                if (ethernetPkg) {
                    this.packages.push(ethernetPkg);
                    return;
                }
            }
            const hadConfig = !!this.config;
            if (configPkg) {
                this.config = configPkg;
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
        if (!this._defaultConfig) {
            this.device.sendLine(CONFIG);
            return;
        }
        if (this.config) {
            const { ip, ...rest } = this._defaultConfig;
            const updated = this.config.updateWith({
                ...rest,
                ip: this.canSetIP ? (this.config.ip ?? ip) : null
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
