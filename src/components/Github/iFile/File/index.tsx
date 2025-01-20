import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/cms/File';
import FileStub from '@tdev-models/cms/FileStub';
import shared from '../styles.module.scss';
import styles from './styles.module.scss';
import ImagePreview from './ImagePreview';
import Icon from '@mdi/react';
import Button from '@tdev-components/shared/Button';
import { mdiCircleEditOutline, mdiContentSave, mdiLoading, mdiRestore } from '@mdi/js';
import { useStore } from '@tdev-hooks/useStore';
import { ApiState } from '@tdev-stores/iStore';
interface Props {
    file: FileModel | FileStub;
}

const File = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const { file } = props;
    return (
        <li className={clsx(styles.file, shared.item)}>
            <Icon path={file.icon} size={0.8} color={file.iconColor} />
            <span className={clsx(shared.item)}>{file.name}</span>
            {file.isImage ? (
                <ImagePreview file={file} />
            ) : (
                <Button
                    icon={mdiCircleEditOutline}
                    color="orange"
                    size={0.7}
                    onClick={() => {
                        cmsStore.setIsEditing(file, true);
                    }}
                />
            )}
            {file.type === 'file' && file.isDirty && (
                <>
                    <Button
                        icon={file.apiState === ApiState.SYNCING ? mdiLoading : mdiContentSave}
                        spin={file.apiState === ApiState.SYNCING}
                        color="green"
                        size={0.7}
                        disabled={cmsStore.isOnMainBranch}
                        onClick={() => {
                            file.save();
                        }}
                    />
                    <Button
                        icon={mdiRestore}
                        color="black"
                        size={0.7}
                        onClick={() => {
                            file.reset();
                        }}
                    />
                </>
            )}
        </li>
    );
});
export default File;
