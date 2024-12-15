import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

import { QRCodeCanvas } from 'qrcode.react';
import Link from '@docusaurus/Link';
import TextAreaInput from '@tdev-components/shared/TextAreaInput';

interface Props {
    text: string;
    showText?: boolean;
    size?: string | number;
    className?: string;
    isLink?: boolean;
    withInput?: boolean;
    qrProps?: React.ComponentProps<typeof QRCodeCanvas>;
}
const Generator = (props: Props) => {
    const [text, setText] = React.useState(props.text || '');
    const [width, setWidth] = React.useState<number | undefined>(208); // 13 * 16 = 208, 1em = 16px
    const ref = React.useRef<HTMLDivElement>(null);
    React.useLayoutEffect(() => {
        const element = ref.current;
        if (element) {
            const { width } = element.getBoundingClientRect();
            setWidth(width);
            const resizeObserver = new ResizeObserver((entries) => {
                setWidth(entries[0].contentRect.width);
            });
            resizeObserver.observe(element);
            return () => {
                resizeObserver.unobserve(element);
            };
        }
    }, []);
    const showFooter = props.showText;

    return (
        <div className={clsx('card', styles.qr, props.className)} style={{ width: props.size }}>
            <div className={clsx(styles.generator, 'card__body')}>
                <div ref={ref}>
                    <QRCodeCanvas
                        {...(props.qrProps || {})}
                        value={text}
                        size={width}
                        className={clsx(styles.qrImage)}
                    />
                </div>
                {props.withInput && (
                    <TextAreaInput
                        defaultValue={props.text}
                        onChange={setText}
                        className={clsx(styles.qrInput)}
                    />
                )}
            </div>
            {showFooter && (
                <div className={clsx(styles.footer, 'card__footer')}>
                    {props.isLink ? (
                        <Link to={props.text} className={clsx(styles.qrText)}>
                            {props.text}
                        </Link>
                    ) : (
                        <div className={clsx(styles.qrText)}>{props.text}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Generator;
