import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';

const Router = observer((): React.ReactNode => {
    return (
        <Layout title={`Network Microbit Router`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Router</h1>
                <h2>Interface 1</h2>
                <Webserial
                    deviceId="router1"
                    baudRate={115200}
                    hideLogs
                    resetTrigger="::READY::"
                    output={<NetworkDevice config={{ mode: 'router', radioPower: 1 }} />}
                />
                <h2>Interface 2</h2>
                <Webserial
                    deviceId="router2"
                    baudRate={115200}
                    hideLogs
                    resetTrigger="::READY::"
                    output={<NetworkDevice config={{ mode: 'router', radioPower: 1 }} />}
                />
            </main>
        </Layout>
    );
});

export default Router;
