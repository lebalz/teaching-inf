import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../hooks/useFirstMainDocument';

interface Props extends MetaInit {
    id: string;
}

const Component = observer((props: Props) => {
    const [meta] = React.useState(new TaskMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!doc) {
        return <div>Load</div>;
    }
    return <div></div>;
});

export default Component;
