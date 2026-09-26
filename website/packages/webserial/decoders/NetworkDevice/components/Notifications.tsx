import Alert from '@tdev-components/shared/Alert';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Decoder from '../models/Decoder';
import styles from './styles.module.scss';

interface Props {
    decoder: Decoder;
}

const Notifications = observer((props: Props) => {
    const { decoder } = props;
    React.useEffect(() => {
        const timeout = setInterval(() => {
            decoder.cleanupNotifications();
        }, 1000);
        return () => clearInterval(timeout);
    }, [decoder]);

    return (
        <div className={clsx(styles.notifications)}>
            <div className={clsx(styles.msgs)}>
                {decoder.notifications.map((n, idx) => {
                    return (
                        <Alert
                            key={idx}
                            type={n.type}
                            onDiscard={() => {
                                decoder.discardNotification(n.timestamp);
                            }}
                        >
                            {n.message}
                        </Alert>
                    );
                })}
            </div>
        </div>
    );
});

export default Notifications;
