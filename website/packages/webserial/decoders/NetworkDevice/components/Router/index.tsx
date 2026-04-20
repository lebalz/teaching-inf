import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import { useRouterConfig } from '../../hooks/useRouterConfig';
import React from 'react';
import { default as RouterModel } from '../../models/Router';
import { Config } from '../../models/DeviceConfig';
import Icon from '@mdi/react';
import { mdiClose, mdiPlusCircle, mdiRouter } from '@mdi/js';
import Badge from '@tdev-components/shared/Badge';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { Confirm } from '@tdev-components/shared/Button/Confirm';

interface Props {
    nr: number;
    config: Config;
    router: RouterModel;
    routerId: string;
    removable?: boolean;
}
const NIC = observer((props: Props) => {
    const { nr, config, router, routerId } = props;
    const viewStore = useStore('viewStore');
    const webserialStore = viewStore.useStore('webserialStore');
    const deviceId = `${routerId}-interface-${nr + 1}`;
    const decoderId = `${routerId}-nic-${nr + 1}`;
    const device = webserialStore.devices.get(deviceId);
    return (
        <div className={clsx(styles.nic)}>
            <div className={clsx(styles.header)}>
                <h2>
                    Interface {nr + 1} {config.ip && !device?.isConnected && <Badge>{config.ip}</Badge>}
                </h2>
                <div className={clsx(styles.action)}>
                    {props.removable && (
                        <Confirm
                            icon={mdiClose}
                            confirmText="Interface wirklich entfernen?"
                            onConfirm={() => {
                                router.removeInterface(decoderId);
                                window.location.reload();
                            }}
                        />
                    )}
                </div>
            </div>
            <Webserial
                deviceId={deviceId}
                baudRate={115200}
                hideLogs
                resetTrigger="::READY::"
                output={<NetworkDevice config={config} id={decoderId} router={router} noIcon />}
            />
        </div>
    );
});

interface RouterProps {
    syncQueryString?: boolean;
}

const Router = observer((props: RouterProps): React.ReactNode => {
    const { syncQueryString = false } = props;
    const rid = React.useId();
    const configs = useRouterConfig([{ radioPower: 1, ip: '192.168.0.1' }]);
    const router = React.useMemo(() => {
        return new RouterModel(syncQueryString);
    }, [configs]);

    React.useEffect(() => {
        return () => router.dispose();
    }, []);

    if (!router) {
        return null;
    }

    return (
        <div className={clsx(styles.router, styles[`nics${configs.length}`])}>
            <div className={clsx(styles.ico)}>
                <Icon path={mdiRouter} size={4} className={clsx(styles.ico)} color="var(--ifm-color-blue)" />
                <Button
                    icon={mdiPlusCircle}
                    onClick={() => {
                        const newConfig = {
                            radioPower: 1,
                            ip: `${Math.floor(Math.random() * 253) + 1}.0.0.1`
                        };
                        const current = router.queryString();
                        const newQueryString = `${current}&ip=${newConfig.ip}&power=${newConfig.radioPower}&nic=${current.split('nic=').length}`;
                        const newUrl = `${window.location.pathname}?${newQueryString}`;
                        window.history.replaceState(null, '', newUrl);
                        window.location.reload();
                    }}
                />
            </div>
            {configs.map((config, idx) => {
                return (
                    <NIC
                        key={idx}
                        routerId={rid}
                        nr={idx}
                        config={config}
                        router={router}
                        removable={idx === configs.length - 1}
                    />
                );
            })}
        </div>
    );
});

export default Router;
