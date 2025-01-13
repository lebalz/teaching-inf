import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import Button from '..';
import { mdiClose, mdiTrashCan, mdiTrashCanOutline } from '@mdi/js';
import { Color } from '@tdev-components/shared/Colors';

interface Props {
    className?: string;
    onDelete: () => void;
    title?: string;
    icon?: string;
    iconOutline?: string;
    color?: Color | string;
    confirmMessage?: string;
    text?: string | null;
}

const getValue = (value: undefined | string | null, defaultVal: string) => {
    if (value === null) {
        return undefined;
    }
    return value ?? defaultVal;
};

export const Delete = (props: Props) => {
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    return (
        <div className={clsx(styles.delete, props.className, 'button-group')}>
            {confirmDelete && (
                <Button
                    icon={mdiClose}
                    iconSide="left"
                    size={1}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(false);
                    }}
                />
            )}
            <Button
                text={
                    (confirmDelete
                        ? getValue(props.confirmMessage, 'Ja')
                        : getValue(props.text, 'Löschen')) as string
                }
                title={props.title}
                color={props.color || 'red'}
                icon={confirmDelete ? props.icon || mdiTrashCan : props.iconOutline || mdiTrashCanOutline}
                size={1}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirmDelete) {
                        props.onDelete();
                    } else {
                        setConfirmDelete(true);
                    }
                }}
            />
        </div>
    );
};

export default Button;
