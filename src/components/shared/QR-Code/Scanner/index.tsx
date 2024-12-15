import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Loader from '@tdev-components/Loader';
import Button from '@tdev-components/shared/Button';
import { useClientLib } from '@tdev-hooks/useClientLib';
import type { default as QrScannerLib } from '@yudiel/react-qr-scanner';
import Storage from '@tdev-stores/utils/Storage';
import { mdiCameraFlipOutline } from '@mdi/js';

interface Props {}
const Scanner = observer((props: Props) => {
    const Lib = useClientLib<typeof QrScannerLib>(
        () => import('@yudiel/react-qr-scanner'),
        '@yudiel/react-qr-scanner'
    );
    if (!Lib) {
        return <Loader />;
    }
    return <ScannerComponent Lib={Lib} {...props} />;
});

const ScannerComponent = (props: { Lib: typeof QrScannerLib } & Props) => {
    const { Lib } = props;
    const [qr, setQr] = React.useState('');
    const [stop, setStop] = React.useState(false);
    const [deviceId, setDeviceId] = React.useState<string | undefined>(undefined);
    const devices = Lib.useDevices();
    const deviceIdx = devices.findIndex((d) => d.deviceId === deviceId);
    /** ensure the video feed is resumed after changing the tab */
    React.useLayoutEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (qr || !Lib) {
                    return;
                }
                setStop(true);
                setTimeout(() => {
                    setStop(false);
                }, 10);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [qr]);
    React.useEffect(() => {
        if (devices.length > 1) {
            const deviceId = Storage.get('QrScannerDeviceId', undefined);
            if (devices.find((d) => d.deviceId === deviceId)) {
                setDeviceId(deviceId);
            } else {
                Storage.remove('QrScannerDeviceId');
            }
        }
    }, [devices]);
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.scanner, 'card__body')}>
                <Lib.Scanner
                    paused={!!qr || stop}
                    onScan={(result) => {
                        setQr(result[0].rawValue);
                    }}
                    constraints={{
                        deviceId: deviceId
                    }}
                    allowMultiple={false}
                    components={{
                        audio: false,
                        torch: true,
                        finder: true,
                        zoom: true,
                        onOff: true
                    }}
                />
            </div>
            <div className="card__footer">
                {devices.length > 1 && (
                    <Button
                        icon={mdiCameraFlipOutline}
                        text={
                            devices.length > 2
                                ? `${(deviceIdx >= 0 ? deviceIdx : 0) + 1}/${devices.length}`
                                : ''
                        }
                        onClick={() => {
                            const nextDeviceIdx = ((deviceIdx >= 0 ? deviceIdx : 0) + 1) % devices.length;
                            setDeviceId(devices[nextDeviceIdx].deviceId);
                            Storage.set('QrScannerDeviceId', devices[nextDeviceIdx].deviceId);
                        }}
                    />
                )}
                {qr && (
                    <>
                        <small>{qr}</small>
                        <div className="button-group button-group--block">
                            <Button
                                className={clsx('button--block')}
                                text="Neu scannen"
                                color="secondary"
                                onClick={() => setQr('')}
                            />
                            <Button
                                className={clsx('button--block')}
                                color="primary"
                                text="Besuchen"
                                href={qr}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Scanner;
