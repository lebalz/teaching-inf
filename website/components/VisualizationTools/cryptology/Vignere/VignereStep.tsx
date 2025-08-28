import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';

interface Props {}

const VignereStep = observer((props: Props) => {
    const store = useStore('siteStore');
    const { vignere } = store.toolsStore;

    return (
        <div className={clsx(styles.vignereStep)}>
            <div className={clsx(styles.step)}>
                <span className={clsx(styles.label, styles.textChar)}>Klartext:</span>
                <span className={clsx(styles.label, styles.keyChar)}>Schlüssel:</span>
                <span className={clsx(styles.label, styles.cipherChar)}>Geheimtext:</span>
            </div>
            {vignere.state.map((step, idx) => (
                <div key={idx} className={clsx(styles.step)}>
                    <span className={clsx(styles.char, styles.textChar)}>{step.textChar}</span>
                    <span className={clsx(styles.char, styles.keyChar)}>{step.keyChar}</span>
                    <span className={clsx(styles.char, styles.cipherChar)}>{step.cipherChar}</span>
                </div>
            ))}
        </div>
    );
});

export default VignereStep;
