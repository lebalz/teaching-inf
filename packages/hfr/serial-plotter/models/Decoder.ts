import SerialDevice, { ConnectionState, iSubscriber } from '@tdev/webserial/models/SerialDevice';
import { action, computed, observable } from 'mobx';

export interface Measurement {
    timestamp: number;
    [key: string]: number;
}
export interface Config {
    timestamp: number;
    [key: string]: number;
}

class Decoder implements iSubscriber {
    readonly id: string;
    readonly device: SerialDevice;
    readonly config: Config;
    readonly separator: string;
    readonly indices: number[];
    readonly labels: string[];
    readonly dataLabels: string[];
    readonly maxIndex: number;
    @observable accessor sampleSize: number;

    data = observable.array<Measurement>([], { deep: false });

    constructor(id: string, device: SerialDevice, separator: string, config: Config, sampleSize = 200) {
        this.id = id;
        this.device = device;
        this.config = config;
        this.separator = separator;
        this.indices = [...Object.values(this.config)];
        this.labels = Object.keys(this.config);
        this.maxIndex = Math.max(...this.indices);
        this.dataLabels = this.labels.filter((l) => l !== 'timestamp');
        this.device.subscribe(this);
        this.sampleSize = sampleSize;
    }

    @action
    onNewLines(newLines: string[]) {
        for (const line of newLines) {
            const parts = line.split(this.separator).map((part) => part.trim());
            if (parts.length < this.maxIndex + 1) {
                continue;
            }
            const values = this.indices.map((idx) => Number.parseFloat(parts[idx]));
            if (values.length === 0 || values.every((value) => isNaN(value))) {
                continue;
            }
            const measurement: Measurement = this.labels.reduce(
                (acc, label, i) => {
                    acc[label] = values[i];
                    return acc;
                },
                {} as { [key: string]: number } as Measurement
            );
            this.data.push(measurement);
        }
    }

    @computed
    get current(): Measurement | null {
        if (this.data.length === 0) {
            return null;
        }
        return this.data[this.data.length - 1];
    }

    @computed
    get sampledData(): Measurement[] {
        const data = this.data;
        const len = data.length;
        const size = this.sampleSize;
        if (len <= size) {
            return data.slice();
        }
        const result = new Array<Measurement>(size);
        result[0] = data[0];
        const step = (len - 1) / (size - 1);
        for (let i = 1; i < size - 1; i++) {
            result[i] = data[Math.round(i * step)];
        }
        result[size - 1] = data[len - 1];
        return result;
    }

    @computed
    get recentData(): Measurement[] {
        if (this.data.length < 20) {
            return this.data.slice().reverse();
        }
        return this.data.slice(-20).reverse();
    }

    @action
    reset() {
        this.data.clear();
    }

    @action
    cleanup() {
        this.device.unsubscribe(this.id);
    }
}

export default Decoder;
