import { mdiLaptop, mdiRouter, mdiRouterNetwork, mdiSwitch } from '@mdi/js';

class DeviceConfig {
    static readonly SEPARATOR = ' ';
    readonly mode: 'router' | 'client' | 'switch';
    readonly ip: string;

    constructor(mode: 'router' | 'client' | 'switch', ip: string) {
        this.mode = mode;
        this.ip = ip;
    }

    static parse(line: string): DeviceConfig | null {
        const [mode, ip] = line.split(DeviceConfig.SEPARATOR);
        if (!mode || !ip || !['router', 'client', 'switch'].includes(mode)) {
            return null;
        }
        return new DeviceConfig(mode as 'router' | 'client' | 'switch', ip);
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
