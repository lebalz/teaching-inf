import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import useIsBrowser from '@docusaurus/useIsBrowser';

interface Props {
    name: string;
    label?: string;
    hideEmpty?: boolean;
}

const CmsEntry = observer((props: Props) => {
    const { name, label, hideEmpty } = props;
    const textId = React.useContext(CmsTextContext)?.entries[name];
    const userStore = useStore('userStore');
    const isBrowser = useIsBrowser();
    const cmsText = useFirstCmsTextDocumentIfExists(textId);
    if (!isBrowser || !textId) {
        return null;
    }
    if (!cmsText || (!cmsText.canDisplay && !userStore.isUserSwitched)) {
        return null;
    }
    if (cmsText.text === '' && hideEmpty) {
        return null;
    }

    return (
        <>
            {label && <dt className={clsx(styles.label)}>{props.label}</dt>}
            <dd>{cmsText.text}</dd>
        </>
    );
});

export default CmsEntry;
