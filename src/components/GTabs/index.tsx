import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

interface Props {
    children: ReactNode[];
    getLabel: (idx: number) => string;
    highlighted?: number[];
    hilightIcon?: string;
    groupId?: string;
    lazy?: boolean;
}

const getValue = (idx: number) => {
    return `s-${idx}`;
};

// Generated Tabs
const GTabs = (props: Props) => {
    const [lazy, setLazy] = React.useState(false);
    React.useEffect(() => {
        const iDisposer = setTimeout(() => {
            setLazy(props.lazy || false);
        }, 200);
        return () => {
            clearTimeout(iDisposer);
        };
    }, [props.lazy]);
    return (
        <Tabs
            defaultValue={getValue(0)}
            className={clsx(styles.tabs)}
            groupId={props.groupId}
            lazy={lazy}
            values={props.children.map((_, idx) => {
                const isHighlight = (props.highlighted || []).includes(idx);
                const label = (
                    <span className={clsx(styles.label)}>
                        {isHighlight && (
                            <span className={clsx(styles.icon)}>{props.hilightIcon || '⚠️'}</span>
                        )}
                        {props.getLabel(idx)}
                    </span>
                );
                return { value: getValue(idx), label: label as any as string };
            })}
        >
            {props.children.map((item, idx) => (
                <TabItem value={getValue(idx)} key={idx}>
                    {item}
                </TabItem>
            ))}
        </Tabs>
    );
};

export default GTabs;
