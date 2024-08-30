import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Popup from 'reactjs-popup';
import { mdiCodepen, mdiFileCodeOutline, mdiPlusCircleOutline, mdiScriptOutline } from '@mdi/js';
import Button from '@site/src/components/shared/Button';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DefinitionList from '@site/src/components/DefinitionList';
import { useStore } from '@site/src/hooks/useStore';
import { DocumentType } from '@site/src/api/document';

interface Props {
    id: string;
}

const NewItem = observer((props: Props) => {
    const documentRootStore = useStore('documentRootStore');
    const documentStore = useStore('documentStore');
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
                <div className={clsx('card__header', styles.header)}>
                    Neues Element
                </div>
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
                                                documentRootId: props.id,
                                                type: DocumentType.File,
                                                data: {
                                                    name: 'Python'
                                                }
                                            });
                                            if (!file || typeof file === 'string') {
                                                return;
                                            }
                                            const script = await documentStore.create({
                                                documentRootId: props.id,
                                                parentId: file.id,
                                                type: DocumentType.File,
                                                data: {
                                                    name: 'Python'
                                                }
                                            });
                                            console.log(script);
                                        }}
                                    />
                                </dd>
                            </DefinitionList>
                        </TabItem>
                        <TabItem value="quill-v2" label="Textfeld">
                            <div>Textfeld</div>
                        </TabItem>
                        <TabItem value="dir" label="Ordner">
                            <div>Ordner</div>
                        </TabItem>
                    </Tabs>
                </div>
            </div>
        </Popup>
    )
});

export default NewItem;
