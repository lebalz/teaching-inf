import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { default as FileModel, MetaInit, ModelMeta } from '@site/src/models/documents/File';
import Icon from '@mdi/react';
import {
    mdiContentSaveEdit,
    mdiFile,
    mdiFileEdit,
    mdiFolder,
    mdiPlusCircle,
    mdiPlusCircleOutline,
    mdiRenameOutline
} from '@mdi/js';
import Details from '@theme/Details';
import Heading from '@theme/Heading';
import Button from '../../shared/Button';
import SyncStatus from '../../SyncStatus';

interface Props {
    file: FileModel;
}

const File = observer((props: Props) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const isInitialized = React.useRef(false);
    const {file} = props;
    return (
        <Details
            open={file.isOpen}
            onToggle={(e) => {
                if (isInitialized.current) {
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
                                placeholder="Suche..."
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
                    <div className={clsx(styles.actions)}>
                    </div>
                </summary>
            }
        >
            <div className={clsx(styles.content)}>
                
            </div>
        </Details>
    );
});

export default File;
