import { orderBy } from 'es-toolkit/array';
import { Config } from '../models/DeviceConfig';
import React from 'react';

const parseQueryParams = (search: string, configs: Partial<Omit<Config, 'mode'>>[] = []): Config[] => {
    const params = new URLSearchParams(search);
    const powers = params
        .getAll('power')
        .map((p, idx) => parseInt(p || configs[idx]?.radioPower?.toString() || '1', 10));
    const groups = params
        .getAll('group')
        .map((p, idx) => parseInt(p || configs[idx]?.radioGroup?.toString() || '0', 10));
    const addresses = params
        .getAll('address')
        .map((p, idx) => parseInt(p || configs[idx]?.radioAddress?.toString() || '1969383796', 10));
    const ips = params.getAll('ip');
    const gateways = params.getAll('gateway');
    const count = Math.max(
        powers.length,
        groups.length,
        addresses.length,
        ips.length,
        gateways.length,
        configs.length
    );

    return orderBy(
        [...Array(count).keys()].map((_, i) => ({
            mode: 'router',
            ip: ips[i] || configs[i]?.ip || 'None',
            defaultGateway: gateways[i] || configs[i]?.defaultGateway || 'None',
            radioPower: powers[i] || parseInt(configs[i]?.radioPower?.toString() || '1', 10),
            radioGroup: groups[i] || parseInt(configs[i]?.radioGroup?.toString() || '0', 10),
            radioAddress: addresses[i] || parseInt(configs[i]?.radioAddress?.toString() || '1969383796', 10)
        })),
        ['ip'],
        ['asc']
    );
};

export const useRouterConfig = (initialConfigs: Partial<Omit<Config, 'mode'>>[]): Config[] => {
    const [configs, setConfigs] = React.useState<Config[]>([]);
    React.useEffect(() => {
        const location = window.location;
        const configs = parseQueryParams(location.search, initialConfigs);
        setConfigs(configs);
    }, []);
    return configs;
};
