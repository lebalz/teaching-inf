import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Popup from 'reactjs-popup';
import { mdiFileCodeOutline, mdiFileDocument, mdiFolderPlus, mdiPlusCircleOutline } from '@mdi/js';
import Button from '@site/src/components/shared/Button';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DefinitionList from '@site/src/components/DefinitionList';
import { useStore } from '@site/src/hooks/useStore';
import { DocumentType } from '@site/src/api/document';
import Directory from '@site/src/models/documents/Directory';
import { Delta } from 'quill/core';

interface Props {
    directory: Directory;
}

const NewItem = observer((props: Props) => {
    const documentStore = useStore('documentStore');
    const { directory } = props;
    if (!directory.root) {
        return null;
    }
    const rootId = directory.root.id;
    return (
        <Popup
            trigger={
                <span>
                    <Button text="Neu" icon={mdiPlusCircleOutline} color="primary" size={0.7} />
                </span>
            }
            modal
            overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
        >
            <div className={clsx('card', styles.card)}>
                <div className={clsx('card__header', styles.header)}>Neues Element</div>
                <div className={clsx('card__body', styles.body)}>
                    <Tabs defaultValue="script">
                        <TabItem value="script" label="Python">
                            <DefinitionList>
                                <dt>Titel</dt>
                                <dd>Python</dd>
                                <dt>Erstellen</dt>
                                <dd>
                                    <Button
                                        text="Erstellen"
                                        color="primary"
                                        size={1}
                                        icon={mdiFileCodeOutline}
                                        onClick={async () => {
                                            const file = await documentStore.create({
                                                documentRootId: rootId,
                                                parentId: directory.id,
                                                type: DocumentType.File,
                                                data: {
                                                    name: 'Python'
                                                }
                                            });
                                            if (!file || typeof file === 'string') {
                                                return;
                                            }
                                            const script = await documentStore.create({
                                                documentRootId: rootId,
                                                parentId: file.id,
                                                type: DocumentType.Script,
                                                data: {
                                                    code: '\n'
                                                }
                                            });
                                            console.log(script);
                                        }}
                                    />
                                </dd>
                            </DefinitionList>
                        </TabItem>
                        <TabItem value="quill-v2" label="Textfeld">
                            <DefinitionList>
                                <dt>Titel</dt>
                                <dd>Quill</dd>
                                <dt>Erstellen</dt>
                                <dd>
                                    <Button
                                        text="Erstellen"
                                        color="primary"
                                        size={1}
                                        icon={mdiFileDocument}
                                        onClick={async () => {
                                            const file = await documentStore.create({
                                                documentRootId: rootId,
                                                parentId: directory.id,
                                                type: DocumentType.File,
                                                data: {
                                                    name: 'Quill'
                                                }
                                            });
                                            if (!file || typeof file === 'string') {
                                                return;
                                            }
                                            const quillDoc = await documentStore.create({
                                                documentRootId: rootId,
                                                parentId: file.id,
                                                type: DocumentType.QuillV2,
                                                data: {
                                                    delta: { ops: [{ insert: '\n' }] } as Delta
                                                }
                                            });
                                            console.log(quillDoc);
                                        }}
                                    />
                                </dd>
                            </DefinitionList>
                        </TabItem>
                        <TabItem value="dir" label="Ordner">
                            <DefinitionList>
                                <dt>Titel</dt>
                                <dd>Ordner</dd>
                                <dt>Erstellen</dt>
                                <dd>
                                    <Button
                                        text="Erstellen"
                                        color="primary"
                                        size={1}
                                        icon={mdiFolderPlus}
                                        onClick={async () => {
                                            const file = await documentStore.create({
                                                documentRootId: rootId,
                                                parentId: directory.id,
                                                type: DocumentType.Dir,
                                                data: {
                                                    name: 'Ordner'
                                                }
                                            });
                                        }}
                                    />
                                </dd>
                            </DefinitionList>
                        </TabItem>
                    </Tabs>
                </div>
            </div>
        </Popup>
    );
});

export default NewItem;
