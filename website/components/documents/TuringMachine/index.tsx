import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';
import { useStore } from '@tdev-hooks/useStore';
import clsx from 'clsx';
import Popup from 'reactjs-popup';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import { MetaInit, TuringMachineMeta } from '@tdev-models/documents/TuringMachine';

export interface Props extends MetaInit {
    id: string;
    hideWarning?: boolean;
}
const TuringMachine = observer((props: Props) => {
    const [meta] = React.useState(new TuringMachineMeta(props));
    const { id } = props;
    const doc = useFirstMainDocument(props.id, meta);
});

export default TuringMachine;
