import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Loader from '@tdev-components/Loader';
import { useQrScanner } from '@tdev-hooks/useQrScanner';
import Button from '@tdev-components/shared/Button';

interface Props {}
const Scanner = observer((props: Props) => {
    const [qr, setQr] = React.useState('');
    const Lib = useQrScanner();
    if (!Lib) {
        return <Loader />;
    }
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.scanner, 'card__body')}>
                <Lib.Scanner
                    paused={!!qr}
                    onScan={(result) => {
                        setQr(result[0].rawValue);
                    }}
                    allowMultiple={false}
                />
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
