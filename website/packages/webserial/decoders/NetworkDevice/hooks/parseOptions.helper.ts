import { Config } from '../models/DeviceConfig';

export const parseQueryParams = (
    search: string,
    config: Partial<Omit<Config, 'mode'>> = {},
    ipConfig: { ip?: string; defaultGateway?: string } = {}
) => {
    const params = new URLSearchParams(search);
    return {
        power: parseInt(params.get('power') || config.radioPower?.toString() || '1', 10),
        group: parseInt(params.get('group') || config.radioGroup?.toString() || '0', 10),
        address: parseInt(params.get('address') || config.radioAddress?.toString() || '1969383796', 10),
        ip: params.get('ip') || ipConfig.ip || 'None',
        defaultGateway: params.get('gateway') || ipConfig.defaultGateway || 'None'
    };
};
