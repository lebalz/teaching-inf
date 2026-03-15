import { mdiLaptop, mdiRouter } from '@mdi/js';
const mdiSwitch =
    'M 6.05 14.94 V 10.94 H 14.97 L 15 8.93 H 6.05 V 4.94 L 1.05 9.94 Z M 18 18.94 V 14.94 H 9.08 L 9.05 12.93 H 18 V 8.94 L 23 13.94 Z';

type Mode = (typeof DeviceConfig.MODES)[number];

class DeviceConfig {
    static readonly SEPARATOR = ' ';
    static readonly MODES = ['router', 'client', 'switch'] as const;
    readonly mode: Mode;
    readonly ip: string;

    constructor(mode: Mode, ip: string) {
        this.mode = mode;
        this.ip = ip;
    }

    static parse(line: string): DeviceConfig | null {
        const [mode, ip] = line.split(DeviceConfig.SEPARATOR);
        if (!mode || !ip || !DeviceConfig.MODES.includes(mode as Mode)) {
            return null;
        }
        return new DeviceConfig(mode as Mode, ip);
    }

    get icon() {
        switch (this.mode) {
            case 'router':
                return mdiRouter;
            case 'client':
                return mdiLaptop;
            case 'switch':
                return mdiSwitch;
        }
    }
}

export default DeviceConfig;
