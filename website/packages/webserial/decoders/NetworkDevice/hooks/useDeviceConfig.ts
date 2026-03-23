import { Config } from '../models/DeviceConfig';
import React from 'react';

const parseQueryParams = (
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
        defaultGateway: params.get('defaultGateway') || ipConfig.defaultGateway || 'None'
    };
};

export const useDeviceConfig = (
    mode: 'client' | 'switch' | 'router' = 'client',
    initialConfig?: Partial<Omit<Config, 'mode'>>,
    ipConfig?: { ip?: string; defaultGateway?: string }
): Config | null => {
    const [config, setConfig] = React.useState<Config | null>(null);
    React.useEffect(() => {
        const location = window.location;
        const { power, group, address, ip, defaultGateway } = parseQueryParams(
            location.search,
            initialConfig,
            ipConfig
        );
        setConfig({ mode, radioPower: power, radioGroup: group, radioAddress: address, ip, defaultGateway });
    }, [mode]);
    return config;
};
