import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import WithCmsText, { CmsTextEntries } from '@tdev-components/documents/CmsText/WithCmsText';
import CmsEntry from './CmsEntry';
import DefinitionList from '@tdev-components/DefinitionList';
import type { DocumentRootStore } from '@tdev-stores/DocumentRootStore';

export type LabelFunction = (entries: CmsTextEntries, docRootStore: DocumentRootStore) => string;
interface Props {
    entries: CmsTextEntries;
    labels: { [key: string]: string | LabelFunction };
    postfixes?: { [key: string]: string | LabelFunction };
    className?: string;
    hideEmpty?: boolean;
}

const WithCmsDefList = observer((props: Props) => {
    const names = React.useMemo(() => Object.keys(props.entries), [props.entries]);
    return (
        <DefinitionList className={clsx(props.className)}>
            <WithCmsText {...props}>
                {names.map((name) => {
                    return (
                        <CmsEntry
                            key={name}
                            name={name}
                            label={props.labels[name]}
                            postfix={props.postfixes?.[name]}
                            hideEmpty={props.hideEmpty}
                        />
                    );
                })}
            </WithCmsText>
        </DefinitionList>
    );
});

export default WithCmsDefList;
