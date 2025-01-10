import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/github/File';
import styles from './styles.module.scss';
interface Props {
    file: FileModel;
}

const ImagePreview = observer((props: Props) => {
    const { file } = props;
    return (
        <div className={clsx(styles.preview, 'card-demo')}>
            <div className="card">
                <div className={clsx(styles.img, 'card__image')}>
                    <img src={file.download_url!} />
                </div>
            </div>
        </div>
    );
});
export default ImagePreview;
