import { orderBy } from 'es-toolkit/array';
import { Config } from '../models/DeviceConfig';
import React from 'react';

const parsedNumber = (value: string | number | undefined | null, defaultValue: number): number => {
    const num = parseInt(`${value}`, 10);
    if (isNaN(num)) {
        return defaultValue;
    }
    return num;
};

export const parseQueryParams = (search: string, configs: Partial<Omit<Config, 'mode'>>[] = []): Config[] => {
    const params = new URLSearchParams(search);
    const powers = params.getAll('power');
    const groups = params.getAll('group');
    const addresses = params.getAll('address');
    const ips = params.getAll('ip');
    const nics = params.getAll('nic');
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
            nic: parsedNumber(nics[i], i + 1),
            defaultGateway: gateways[i] || configs[i]?.defaultGateway || 'None',
            radioPower: parsedNumber(powers[i], configs[i]?.radioPower ?? 1),
            radioGroup: parsedNumber(groups[i], configs[i]?.radioGroup ?? 0),
            radioAddress: parsedNumber(addresses[i], configs[i]?.radioAddress ?? 1969383796)
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
