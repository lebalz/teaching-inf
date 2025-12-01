import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

const GridDemo = () => {
    return (
        <div className={clsx(styles.main)}>
            {Array.from({ length: 9 }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
            ))}
        </div>
    );
};

export default GridDemo;
