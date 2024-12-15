import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

import { QRCodeSVG } from 'qrcode.react';

interface Props {
    content: string;
}
const Generator = (props: Props) => {
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.generator, 'card__body')}>
                <QRCodeSVG value={props.content} size={13 * 16} />
            </div>
        </div>
    );
};

export default Generator;
