import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Heading from '@theme/Heading';
import Badge from '@tdev-components/shared/Badge';

interface Props {
    isOsx?: boolean;
    children: React.ReactNode;
    nr: number;
}

const Page = (props: Props) => {
    
    return (
        <div className={clsx(styles.page)}>
            <Badge className={clsx(styles.pageNr)} color='gray'>{props.nr}</Badge>
            {props.children}
        </div>
    );
};

export default Page;