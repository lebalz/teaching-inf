import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import Loader from '@tdev-components/Loader';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';

interface Props {}
const Scanner = observer((props: Props) => {
    const [qr, setQr] = React.useState('');
    const [paused, setPaused] = React.useState(false);
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.scanner, 'card__body')}>
                <QRScanner
                    paused={paused}
                    onScan={(result) => {
                        console.log(result);
                        setPaused(true);
                    }}
                    allowMultiple={false}
                />
            </div>
        </div>
    );
});

export default Scanner;
