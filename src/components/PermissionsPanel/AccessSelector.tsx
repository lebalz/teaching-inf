import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { Access } from '@site/src/api/document';

interface Props {
    onChange: (access: Access) => void;
    access?: Access;
    className?: string;
}

const AccessSelector = observer((props: Props) => {
    return (
        <div className={clsx(styles.selector, props.className, 'button-group')}>
            {Object.values(Access).map((acc) => (
                <button
                    key={acc}
                    className={clsx(
                        'button',
                        props.access === acc ? 'button--primary' : 'button--secondary',
                        'button--sm',
                        styles.button
                    )}
                    onClick={() => props.onChange(acc)}
                >
                    {acc}
                </button>
            ))}
        </div>
    );
});

export default AccessSelector;
