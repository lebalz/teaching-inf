import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@site/src/models/documents/File';
import Icon from '@mdi/react';
import { mdiFile, mdiRenameOutline } from '@mdi/js';
import Details from '@theme/Details';
import Button from '../../shared/Button';
import SyncStatus from '../../SyncStatus';
import { DocumentType } from '@site/src/api/document';
import Directory from '../Directory';
import CodeEditorComponent from '../CodeEditor';
import { QuillV2Component } from '../QuillV2';

interface Props {
    file: FileModel;
}

const File = observer((props: Props) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const isInitialized = React.useRef(false);
    const { file } = props;
    return (
        <Details
            open={file.isOpen}
            onToggle={(e) => {
                if (isInitialized.current && e.currentTarget === e.target) {
                    file.setIsOpen(!file.isOpen);
                }
            }}
            className={clsx(styles.dir)}
            summary={
                <summary className={clsx(styles.summary)}>
                    <Icon path={mdiFile} size={1} className={clsx(styles.icon)} />
                    <div className={clsx(styles.spacer)} />
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                placeholder="Dateiname..."
                                value={file.name}
                                className={clsx(styles.textInput)}
                                onChange={(e) => {
                                    file.setName(e.target.value);
                                }}
                                onBlur={() => {
                                    setIsEditing(false);
                                }}
                                autoFocus
                            />
                        </>
                    ) : (
                        <>
                            <h4 className={clsx(styles.dirName)}>{file.name}</h4>
                            <Button
                                icon={mdiRenameOutline}
                                color="primary"
                                size={0.7}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            />
                        </>
                    )}
                    <div>
                        <SyncStatus model={file} />
                    </div>
                    <div className={clsx(styles.spacer)} />
                    <div className={clsx(styles.actions)}></div>
                </summary>
            }
        >
            <div className={clsx(styles.content)}>
                {file.document && (
                    <>
                        {file.document.type === DocumentType.Dir && <Directory id={file.document.id} />}
                        {file.document.type === DocumentType.Script && (
                            <CodeEditorComponent script={file.document} />
                        )}
                        {file.document.type === DocumentType.QuillV2 && (
                            <QuillV2Component quillDoc={file.document} />
                        )}
                    </>
                )}
            </div>
        </Details>
    );
});

export default File;
