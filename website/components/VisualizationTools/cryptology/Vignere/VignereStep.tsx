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
        <table className={clsx(styles.vignereStep)}>
            <tr>
                <th>Klartext:</th>
                <td>{vignere.plainText}</td>
            </tr>
            <tr>
                <th>Schlüssel:</th>
                <td>{vignere.keyText}</td>
            </tr>
            <tr>
                <th>Geheimtext:</th>
                <td>{vignere.cipherText}</td>
            </tr>
        </table>
    );
});

export default VignereStep;
