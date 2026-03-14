import { mdiLaptop, mdiRouter, mdiRouterNetwork, mdiSwitch } from '@mdi/js';

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
