import useIsBrowser from '@docusaurus/useIsBrowser';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import type { CmsTextEntries } from '@tdev-components/documents/CmsText/WithCmsText';
import { useStore } from '@tdev-hooks/useStore';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { LabelFunction } from '.';
import styles from './styles.module.scss';

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
    const isEmpty = hideEmpty && cmsText.text?.trim()?.length === 0;
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
