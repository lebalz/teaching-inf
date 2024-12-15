import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Loader from '@tdev-components/Loader';
import Button from '@tdev-components/shared/Button';
import { useClientLib } from '@tdev-hooks/useClientLib';
import type { default as QrScannerLib } from '@yudiel/react-qr-scanner';
import DeviceSelector from './DeviceSelector';

interface Props {}
const Scanner = observer((props: Props) => {
    const [qr, setQr] = React.useState('');
    const [stop, setStop] = React.useState(false);
    const Lib = useClientLib<typeof QrScannerLib>(
        () => import('@yudiel/react-qr-scanner'),
        '@yudiel/react-qr-scanner'
    );
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
    if (!Lib) {
        return <Loader />;
    }
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.scanner, 'card__body')}>
                <Lib.Scanner
                    paused={!!qr || stop}
                    onScan={(result) => {
                        setQr(result[0].rawValue);
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
            <div className={clsx('card__body')}>
                <DeviceSelector useDevices={Lib.useDevices} />
            </div>
            {qr && (
                <div className="card__footer">
                    <small>{qr}</small>
                    <div className="button-group button-group--block">
                        <Button
                            className={clsx('button--block')}
                            text="Neu scannen"
                            color="secondary"
                            onClick={() => setQr('')}
                        />
                        <Button className={clsx('button--block')} color="primary" text="Besuchen" href={qr} />
                    </div>
                </div>
            )}
        </div>
    );
});

export default Scanner;
