import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { LabelFunction } from '.';
import type { CmsTextEntries } from '@tdev-components/documents/CmsText/WithCmsText';

interface Props {
    name: string;
    label?: string | LabelFunction;
    hideEmpty?: boolean;
    postfix?: string | LabelFunction;
}

const CmsEntry = observer((props: Props) => {
    const { name, label: rawLabel, hideEmpty, postfix: rawPostfix } = props;
    const userStore = useStore('userStore');
    const documentRootStore = useStore('documentRootStore');
    const entries = React.useContext(CmsTextContext)?.entries ?? {};
    const textId = entries[name];
    const label =
        typeof rawLabel === 'function' ? rawLabel(entries as CmsTextEntries, documentRootStore) : rawLabel;
    const postfix =
        typeof rawPostfix === 'function'
            ? rawPostfix(entries as CmsTextEntries, documentRootStore)
            : rawPostfix;
    const isBrowser = useIsBrowser();
    const cmsText = useFirstCmsTextDocumentIfExists(textId);
    if (!isBrowser || !textId) {
        return null;
    }
    if (!cmsText || (!cmsText.canDisplay && !userStore.isUserSwitched)) {
        return null;
    }
    const isEmpty = hideEmpty && cmsText.isEmpty;
    if (isEmpty) {
        return null;
    }

    return (
        <>
            {label && <dt className={clsx(styles.label)}>{label}</dt>}
            <dd>
                {cmsText.text}
                {postfix && ' '}
                {postfix}
            </dd>
        </>
    );
});

export default CmsEntry;
