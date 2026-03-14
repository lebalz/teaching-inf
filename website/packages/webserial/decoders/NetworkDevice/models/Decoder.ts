import SerialDevice, { iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, observable } from 'mobx';
import Message from './Message';
import DeviceConfig from './DeviceConfig';

class Decoder implements iSubscriber {
    readonly id: string;
    readonly device: SerialDevice;
    @observable.ref accessor config: DeviceConfig | null = null;

    messages = observable.array<Message>([], { deep: false });

    constructor(id: string, device: SerialDevice) {
        this.id = id;
        this.device = device;
        this.device.subscribe(this);
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
}

export default Decoder;
