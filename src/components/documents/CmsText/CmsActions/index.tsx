import { observer } from 'mobx-react-lite';
import React from 'react';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import CmsXlsxImporter from '../CmsXlsxImporter';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface Props {
    rootId: string;
    className?: string;
}

const CmsActions = observer((props: Props) => {
    return (
        <div className={clsx(styles.actions, props.className)}>
            <CmsXlsxImporter toAssign={[{ id: props.rootId }]} />
            <PermissionsPanel documentRootId={props.rootId} />
        </div>
    );
});

export default CmsActions;
