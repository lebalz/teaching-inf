import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import Loader from '@tdev-components/Loader';
import { useExcalidraw } from '@tdev-hooks/useExcalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { Source } from '@tdev-models/iDocument';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import { reaction } from 'mobx';
import { useColorMode } from '@docusaurus/theme-common';
import _ from 'lodash';
import Preview from './Preview';
import Editor from './Editor';
import SyncStatus from '@tdev-components/SyncStatus';
import { mdiCircleEditOutline, mdiClose, mdiLoading, mdiSyncCircle } from '@mdi/js';
import clsx from 'clsx';
import Button from '@tdev-components/shared/Button';
import { ApiState } from '@tdev-stores/iStore';

export const DEFAULT_HEIGHT = '600px' as const;

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [edit, setEdit] = React.useState(false);
    const Lib = useExcalidraw();
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstRealMainDocument(props.id, meta);

    if (!doc) {
        return <Loader />;
    }
    if (!Lib || !edit) {
        return (
            <div
                className={clsx('card', styles.excalidraw, styles.preview)}
                style={{ height: DEFAULT_HEIGHT }}
            >
                <div className={clsx(styles.actions)}>
                    <SyncStatus model={doc} />
                    <Button
                        icon={Lib ? mdiCircleEditOutline : mdiLoading}
                        spin={!Lib}
                        onClick={() => setEdit(true)}
                        color="orange"
                        className={clsx(styles.edit)}
                        disabled={!Lib || !doc.canEdit}
                    />
                </div>
                <Preview id={props.id} meta={meta} />
            </div>
        );
    }
    return (
        <div style={{ height: DEFAULT_HEIGHT, width: '100%' }} className={clsx(styles.excalidraw)}>
            <div className={styles.actions}>
                <SyncStatus model={doc} />
                <Button
                    onClick={() => {
                        setEdit(false);
                    }}
                    icon={mdiClose}
                />
            </div>

            <Editor Lib={Lib} id={props.id} meta={meta} />
        </div>
    );
});

export default Excalidoc;
