import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { templateReplacer } from '../templateReplacer';

interface BaseProps {
    as?: 'code' | 'boxed';
}
interface NameProps extends BaseProps {
    name: string;
}
interface ChildProps extends BaseProps {
    children: React.ReactNode;
}

type Props = NameProps | ChildProps;

const Dyn = observer((props: Props) => {
    const pageStore = useStore('pageStore');
    const { current } = pageStore;
    if (!current) {
        return null;
    }
    const value =
        'name' in props
            ? current.dynamicValues.get(props.name) || `<${props.name}>`
            : templateReplacer(
                  (Array.isArray(props.children) ? props.children[0] : props.children)?.props?.children,
                  current.dynamicValues
              );
    switch (props.as) {
        case 'code':
            return <code>{value}</code>;
        case 'boxed':
            return <strong className="boxed">{value}</strong>;
    }

    return value;
});

export default Dyn;
