import React from 'react';
import clsx from 'clsx';

import { mdiClose, mdiTrashCan, mdiTrashCanOutline } from '@mdi/js';
import { Color } from '@tdev-components/shared/Colors';
import { Confirm } from '@tdev-components/shared/Button/Confirm';

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

export const Delete = (props: Props) => {
    return (
        <Confirm
            onConfirm={props.onDelete}
            title={props.title}
            icon={props.icon || mdiTrashCan}
            text={props.text || 'Löschen'}
            color={props.color || 'red'}
            confirmIcon={props.iconOutline || mdiTrashCanOutline}
            confirmMessage={props.confirmMessage}
            size={1}
            className={props.className}
            cancelIcon={mdiClose}
        />
    );
};
