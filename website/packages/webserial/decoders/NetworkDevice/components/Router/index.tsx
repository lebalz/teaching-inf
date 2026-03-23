import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import { useRouterConfig } from '../../hooks/useRouterConfig';
import React from 'react';
import { default as RouterModel } from '../../models/Router';
import { Config } from '../../models/DeviceConfig';
import Icon from '@mdi/react';
import { mdiRouter, mdiRouterNetwork } from '@mdi/js';

interface Props {
    nr: number;
    config: Config;
    router: RouterModel;
}
const NIC = observer((props: Props) => {
    const { nr, config, router } = props;
    return (
        <div className={clsx(styles.nic)}>
            <h2>Interface {nr + 1}</h2>
            <Webserial
                deviceId={`interface-${nr + 1}`}
                baudRate={115200}
                hideLogs
                resetTrigger="::READY::"
                output={<NetworkDevice config={config} router={router} noIcon />}
            />
        </div>
    );
});

const Router = observer((): React.ReactNode => {
    const configs = useRouterConfig([
        { radioPower: 1, ip: '192.168.0.1' },
        { radioPower: 1, ip: '10.0.0.1' }
    ]);
    const router = React.useMemo(() => {
        return new RouterModel();
    }, []);
    React.useEffect(() => {
        return () => router.dispose();
    }, []);
    if (!router) {
        return null;
    }

    return (
        <div className={clsx(styles.router, styles[`nics${configs.length}`])}>
            <Icon path={mdiRouter} size={4} className={clsx(styles.ico)} color="var(--ifm-color-blue)" />
            {configs.map((config, idx) => {
                return <NIC key={idx} nr={idx} config={config} router={router} />;
            })}
        </div>
    );
});

export default Router;
