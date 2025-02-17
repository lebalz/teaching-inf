import React, { type ReactNode } from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import Icon from '@mdi/react';
import { mdiFileEyeOutline } from '@mdi/js';

interface Props {
    children: ReactNode | ReactNode[];
}

const DefHeading = (props: Props) => {
    return (
        <div className={clsx(styles.heading)}>
            <Icon path={mdiFileEyeOutline} size={1} />
            {props.children}
        </div>
    );
};

export default DefHeading;
