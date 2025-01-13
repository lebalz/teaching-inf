import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/github/File';
import styles from './styles.module.scss';
import FileStub from '@tdev-models/github/FileStub';
interface Props {
    file: FileModel | FileStub;
}

const ImagePreview = observer((props: Props) => {
    const { file } = props;
    return (
        <div className={clsx(styles.preview, 'card-demo')}>
            <div className="card">
                <div className={clsx(styles.img, 'card__image')}>
                    <img src={file.downloadUrl!} />
                </div>
            </div>
        </div>
    );
});
export default ImagePreview;
