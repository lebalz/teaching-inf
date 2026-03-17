import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';

const Switch = observer((): React.ReactNode => {
    return (
        <Layout title={`Network Microbit Switch`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Switch</h1>
                <Webserial
                    deviceId="switch"
                    baudRate={115200}
                    hideLogs
                    resetTrigger="::READY::"
                    output={<NetworkDevice config={{ mode: 'switch' }} />}
                />
            </main>
        </Layout>
    );
});

export default Switch;
