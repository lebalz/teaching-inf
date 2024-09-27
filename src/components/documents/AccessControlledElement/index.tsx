import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Details from '@theme/Details';
import Loader from '@tdev-components/Loader';
import { MetaInit, ModelMeta } from '@tdev-models/documents/Solution';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { Access } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import Icon from '@mdi/react';
import { mdiCheckAll } from '@mdi/js';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { NoneAccess } from '@tdev-models/helpers/accessPolicy';

interface Props extends MetaInit {
    id: string;
    children: JSX.Element;
    access?: Access;
}

const AccessControlledElement = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const docRoot = useDocumentRoot(props.id, meta, false);
    const userStore = useStore('userStore');
    if (!docRoot || docRoot.isDummy) {
        if (!!userStore.current) {
            return <Loader />;
        } else {
            return <div></div>;
        }
    }
    return (
        <div className={styles.wrapper}>
            {!NoneAccess.has(props.access) &&
            (!NoneAccess.has(docRoot.permission) || userStore.current?.isAdmin) ? (
                <div>{props.children}</div>
            ) : (
                <div></div>
            )}
            <div className={styles.adminControls}>
                {userStore.current?.isAdmin && <PermissionsPanel documentRootId={docRoot.id} />}
                {NoneAccess.has(docRoot.permission) && <span className="badge badge--secondary">Hidden</span>}
            </div>
        </div>
    );
});

export default AccessControlledElement;
