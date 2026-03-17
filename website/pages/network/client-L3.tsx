import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';

const Client = observer((): React.ReactNode => {
    return (
        <Layout title={`Network Microbit Client`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Client</h1>
                <Webserial
                    deviceId="client"
                    baudRate={115200}
                    hideLogs
                    resetTrigger="::READY::"
                    output={<NetworkDevice config={{ mode: 'client', ip: '192.168.0.2', radioPower: 1 }} />}
                />
            </main>
        </Layout>
    );
});

export default Client;
