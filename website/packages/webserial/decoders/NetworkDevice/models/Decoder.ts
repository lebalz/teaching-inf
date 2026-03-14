import SerialDevice, { ConnectionState, iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, computed, observable } from 'mobx';
import Message from './Message';
import DeviceConfig from './DeviceConfig';

const CONFIG = '::CONFIG::';
const SEND = '::SEND::';

class Decoder implements iSubscriber {
    readonly id: string;
    readonly device: SerialDevice;
    @observable.ref accessor config: DeviceConfig | null = null;
    @observable accessor message: string = '';
    @observable accessor receiverIp: string = '';

    @observable accessor ipInput: string = '';

    messages = observable.array<Message>([], { deep: false });

    constructor(id: string, device: SerialDevice) {
        this.id = id;
        this.device = device;
        this.device.subscribe(this);
    }

    @action
    setIpInput(ip: string) {
        this.ipInput = ip;
    }

    @action
    applyIpInput() {
        if (this.config) {
            this.device.sendLine(`${CONFIG} ${this.config.mode} ${this.ipInput}`);
            this.ipInput = '';
        }
    }

    @action
    setMessage(message: string) {
        this.message = message;
    }

    @action
    setReceiverIp(ip: string) {
        this.receiverIp = ip;
    }

    @computed
    get isValidReceiverIp() {
        if (!this.receiverIp) {
            return false;
        }
        const parts = this.receiverIp.split('.');
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
    }

    @computed
    get canSend() {
        return this.message.length > 0 && this.isValidReceiverIp;
    }

    @action
    sendMessage() {
        if (this.canSend) {
            this.device.sendLine(`${SEND} ${this.receiverIp} ${this.message}`);
            this.message = '';
        }
    }

    @action
    onConnectionStateChange(state: ConnectionState) {
        console.log('Connection state changed:', state);
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
            const message = Message.parse(line);
            if (message) {
                this.messages.push(message);
            } else {
                const config = DeviceConfig.parse(line);
                if (config) {
                    this.config = config;
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
            this.device.sendLine(`${CONFIG} ${DeviceConfig.MODES[nextIdx]} ${this.config.ip}`);
        }
    }
}

export default Decoder;
