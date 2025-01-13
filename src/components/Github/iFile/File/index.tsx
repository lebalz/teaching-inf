import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/github/File';
import FileStub from '@tdev-models/github/FileStub';
import shared from '../styles.module.scss';
import styles from './styles.module.scss';
import ImagePreview from './ImagePreview';
import Icon from '@mdi/react';
import Button from '@tdev-components/shared/Button';
import { mdiCircleEditOutline, mdiContentSave } from '@mdi/js';
import { useStore } from '@tdev-hooks/useStore';
interface Props {
    file: FileModel | FileStub;
}

const File = observer((props: Props) => {
    const githubStore = useStore('githubStore');
    const { file } = props;
    return (
        <li className={clsx(styles.file, shared.item)}>
            <Icon path={file.icon} size={0.8} color={file.iconColor} />
            <span className={clsx(shared.item)}>{file.name}</span>
            {file.isImage && <ImagePreview file={file} />}
            <Button
                icon={mdiCircleEditOutline}
                color="orange"
                size={0.7}
                onClick={() => {
                    if (!file.canEdit) {
                        file.fetchContent(true);
                    } else {
                        file.setEditing(true);
                    }
                }}
            />
            {file.type === 'file' && file.isDirty && (
                <Button
                    icon={mdiContentSave}
                    color="green"
                    size={0.7}
                    disabled={githubStore.isOnMainBranch}
                    onClick={() => {
                        githubStore.createOrUpdateFile(file.path, file.content, file.sha);
                    }}
                />
            )}
        </li>
    );
});
export default File;
