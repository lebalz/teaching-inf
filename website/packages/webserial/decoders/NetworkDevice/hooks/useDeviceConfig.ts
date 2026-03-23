import { Config } from '../models/DeviceConfig';
import React from 'react';
import { parseQueryParams } from './parseOptions.helper';

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
