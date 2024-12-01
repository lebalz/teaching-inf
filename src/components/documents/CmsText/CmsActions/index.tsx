import { observer } from 'mobx-react-lite';
import React from 'react';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import CmsXlsxImporter from '../CmsXlsxImporter';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { CmsTextEntries } from '../WithCmsText';

interface Props {
    entries: CmsTextEntries;
    className?: string;
}

const CmsActions = observer((props: Props) => {
    const { entries } = props;
    const documentRootIds = Object.values(entries);
    if (documentRootIds.length === 0) {
        return null;
    }
    return (
        <div className={clsx(styles.actions, props.className)}>
            <CmsXlsxImporter toAssign={entries} />
            {documentRootIds.length === 1 ? (
                <PermissionsPanel documentRootId={documentRootIds[0]} />
            ) : /** TODO: what to do here? */
            null}
        </div>
    );
});

export default CmsActions;
