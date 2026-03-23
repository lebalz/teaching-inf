import { mdiLaptop, mdiRouter } from '@mdi/js';
const mdiSwitch =
    'M 6.05 14.94 V 10.94 H 14.97 L 15 8.93 H 6.05 V 4.94 L 1.05 9.94 Z M 18 18.94 V 14.94 H 9.08 L 9.05 12.93 H 18 V 8.94 L 23 13.94 Z';

type Mode = (typeof DeviceConfig.MODES)[number];

type Radio = {
    address: number | undefined;
    group: number | undefined;
    power: number;
};

export interface Config {
    mode: Mode;
    ip?: string | null;
    defaultGateway?: string | null;
    radioAddress?: number | null;
    radioGroup?: number | null;
    radioPower?: number | null;
}

class DeviceConfig {
    static readonly SEPARATOR = ' ';
    static readonly MODES = ['router', 'client', 'switch'] as const;
    readonly mac: string;
    readonly mode: Mode;
    readonly ip?: string;
    readonly defaultGateway?: string;
    readonly radio: Radio;

    constructor(
        mac: string,
        mode: Mode,
        ip?: string,
        defaultGateway?: string,
        radioAddress?: number,
        radioGroup?: number,
        radioPower = 4
    ) {
        this.mac = mac;
        this.mode = mode;
        this.ip = ip;
        this.defaultGateway = defaultGateway;
        this.radio = {
            address: radioAddress,
            group: radioGroup,
            power: radioPower
        };
    }

    updateWith(config: Partial<Config>) {
        return new DeviceConfig(
            this.mac,
            config.mode ?? this.mode,
            config.ip === null ? undefined : (config.ip ?? this.ip),
            config.defaultGateway === null ? undefined : (config.defaultGateway ?? this.defaultGateway),
            config.radioAddress === null ? undefined : (config.radioAddress ?? this.radio.address),
            config.radioGroup === null ? undefined : (config.radioGroup ?? this.radio.group),
            config.radioPower === null ? undefined : (config.radioPower ?? this.radio.power)
        );
    }

    get config(): Config {
        return {
            mode: this.mode,
            ip: this.ip,
            defaultGateway: this.defaultGateway,
            radioAddress: this.radio.address,
            radioGroup: this.radio.group,
            radioPower: this.radio.power
        };
    }

    get configString() {
        const ip = this.mode === 'router' ? (this.ip ?? '192.168.0.1') : this.ip;
        return `${this.mode} ${ip ?? 'None'} ${this.defaultGateway ?? 'None'} ${this.radio.address ?? 'None'} ${this.radio.group ?? 'None'} ${this.radio.power}`;
    }

    get queryString() {
        const params = new URLSearchParams();
        if (this.ip) {
            params.set('ip', this.ip);
        }
        if (this.defaultGateway) {
            params.set('defaultGateway', this.defaultGateway);
        }
        if (this.radio.address !== undefined) {
            params.set('address', this.radio.address.toString());
        }
        if (this.radio.group !== undefined) {
            params.set('group', this.radio.group.toString());
        }
        if (this.radio.power !== undefined) {
            params.set('power', this.radio.power.toString());
        }
        return params.toString();
    }

    static parse(line: string): DeviceConfig | null {
        const [cType, mac, mode, ip, defaultGateway, address, group, power] = line
            .split(DeviceConfig.SEPARATOR)
            .map((p) => p.trim())
            .map((p) => (p === 'None' ? undefined : p));
        if (cType !== '::CONFIG::') {
            return null;
        }

        if (!mode || !mac || !DeviceConfig.MODES.includes(mode as Mode)) {
            return null;
        }
        return new DeviceConfig(
            mac,
            mode as Mode,
            ip,
            defaultGateway,
            address ? parseInt(address) : undefined,
            group ? parseInt(group) : undefined,
            power ? parseInt(power) : 4
        );
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
