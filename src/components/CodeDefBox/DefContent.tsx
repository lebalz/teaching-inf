import React, { type ReactNode } from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';

interface Props {
    children: ReactNode | ReactNode[];
}

const DefContent = (props: Props) => {
    return <div className={clsx(styles.content)}>{props.children}</div>;
};

export default DefContent;
