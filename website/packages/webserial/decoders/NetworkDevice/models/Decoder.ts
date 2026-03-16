import SerialDevice, { ConnectionState, iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, computed, observable } from 'mobx';
import IPFrame from './IPFrame';
import DeviceConfig from './DeviceConfig';

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

class Decoder implements iSubscriber {
    readonly id: string;
    readonly device: SerialDevice;
    @observable.ref accessor config: DeviceConfig | null = null;
    @observable accessor message: string = '';
    @observable accessor receiverIp: string = '';
    @observable accessor receiverMac: string = '';

    // just the input field for the IP, not necessarily the actual device IP (which is in config)
    @observable accessor deviceIp: string = '';

    messages = observable.array<IPFrame>([], { deep: false });

    constructor(id: string, device: SerialDevice) {
        this.id = id;
        this.device = device;
        this.device.subscribe(this);
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
            this.messages.clear();
        }
    }

    @action
    onNewLines(lines: string[]) {
        for (const line of lines) {
            const message = IPFrame.parse(line);
            if (message) {
                this.messages.push(message);
            } else {
                const config = DeviceConfig.parse(line);
                if (config) {
                    this.config = config;
                    this.deviceIp = '';
                }
            }
        }
    }

    @action
    reset() {
        this.messages.clear();
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
