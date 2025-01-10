import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/github/File';
import shared from '../styles.module.scss';
import ImagePreview from './ImagePreview';
import Icon from '@mdi/react';
interface Props {
    file: FileModel;
}

const File = observer((props: Props) => {
    const { file } = props;
    return (
        <li>
            <Icon path={file.icon} size={0.8} color={file.iconColor} />
            <span className={clsx(shared.item)}>{file.name}</span>
            {file.isImage && <ImagePreview file={file} />}
        </li>
    );
});
export default File;
