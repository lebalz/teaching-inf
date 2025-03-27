import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import CodeEditor from '@tdev-components/shared/CodeEditor';
import { useDocument } from '@tdev-hooks/useDocument';
import { DocumentType } from '@tdev-api/document';
import { ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import { ExcalidocComponent, Props } from '..';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import Image from '../Preview/Image';
import { ModelMeta } from '@tdev-models/documents/Excalidoc';
import { Source } from '@tdev-models/iDocument';

const ExcalidocWithCodeEditor = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstRealMainDocument(props.id, meta);
    const [showEditor, setShowEditor] = React.useState(false);
    if (!doc) {
        return <Loader />;
    }
    if (!doc.canDisplay) {
        return (
            <div>
                <PermissionsPanel documentRootId={props.id} />
                <Image />
            </div>
        );
    }

    return (
        <div className={clsx(styles.withCodeEditor)}>
            <div className={clsx(styles.excalidraw, styles.item)}>
                <ExcalidocComponent
                    {...props}
                    allowImageInsertion={false}
                    onEdit={setShowEditor}
                    libraryItems={undefined}
                    documentId={doc.id}
                    onlyCommitValidChanges
                />
            </div>
            <div className={clsx(styles.editor, styles.item)}>
                {doc.isInitialized && (
                    <CodeEditor
                        value={JSON.stringify(doc.data.elements, null, 2)}
                        lang="json"
                        maxLines={showEditor ? 30 : 20}
                        readonly={!showEditor}
                        focus={false}
                        onChange={(value) => {
                            if (!value) {
                                return;
                            }
                            try {
                                const elements = JSON.parse(value);
                                elements.forEach((element: { version: number }) => {
                                    element.version = element.version + 1;
                                });
                                console.log(elements);
                                doc.setData(
                                    {
                                        image: '',
                                        files: {},
                                        elements
                                    },
                                    Source.API,
                                    new Date()
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
});

export default ExcalidocWithCodeEditor;
