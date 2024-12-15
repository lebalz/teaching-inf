import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface Props {
    content: string;
    showText?: boolean;
}
const Generator = (props: Props) => {
    const showFooter = props.showText;
    return (
        <div className={clsx('card', styles.qr)}>
            <div className={clsx(styles.generator, 'card__body')}>
                <QRCodeCanvas value={props.content} size={13 * 16} className={clsx(styles.qrImage)} />
            </div>
            {showFooter && (
                <div className={clsx(styles.footer, 'card__footer')}>
                    <div className={clsx(styles.qrText)}>{props.content}</div>
                </div>
            )}
        </div>
    );
};

export default Generator;
