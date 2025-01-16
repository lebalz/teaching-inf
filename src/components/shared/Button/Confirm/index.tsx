import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import Button from '..';
import { mdiClose } from '@mdi/js';
import { Color } from '@tdev-components/shared/Colors';

interface Props {
    className?: string;
    onConfirm: () => void;
    title?: string;
    icon: string;
    text?: string | null;
    cancelIcon?: string;
    confirmIcon?: string;
    confirmMessage?: string;
    confirmColor?: Color | string;
    color?: Color | string;
    size?: number;
    iconSide?: 'left' | 'right';
}

const getValue = (value: undefined | string | null, defaultVal: string) => {
    if (value === null) {
        return undefined;
    }
    return value ?? defaultVal;
};

export const Confirm = (props: Props) => {
    const [isConfirming, setIsConfirming] = React.useState(false);
    return (
        <div className={clsx(styles.confirm, props.className, 'button-group')}>
            {isConfirming && (
                <Button
                    icon={props.cancelIcon || mdiClose}
                    iconSide="left"
                    size={props.size || 1}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsConfirming(false);
                    }}
                />
            )}
            <Button
                text={
                    (isConfirming
                        ? getValue(props.confirmMessage, 'Ja')
                        : getValue(props.text, 'Löschen')) as string
                }
                title={props.title}
                color={isConfirming ? props.confirmColor : props.color}
                icon={isConfirming ? props.confirmIcon || props.icon : props.icon}
                size={props.size || 1}
                iconSide={isConfirming ? 'right' : props.iconSide}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isConfirming) {
                        props.onConfirm();
                    } else {
                        setIsConfirming(true);
                    }
                }}
            />
        </div>
    );
};
