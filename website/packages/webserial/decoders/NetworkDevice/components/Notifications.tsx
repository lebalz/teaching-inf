import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Decoder from '../models/Decoder';
import Alert from '@tdev-components/shared/Alert';

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
