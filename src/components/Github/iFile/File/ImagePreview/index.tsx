import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/cms/File';
import styles from './styles.module.scss';
import FileStub from '@tdev-models/cms/FileStub';
import Card from '@tdev-components/shared/Card';
import { IMAGE_DIR_NAME } from '@tdev-models/cms/Dir';
interface Props {
    file: FileModel | FileStub;
    showPathName?: boolean;
}

const getPathName = (file: FileModel | FileStub) => {
    const { name, path } = file;
    if (path.endsWith(`${IMAGE_DIR_NAME}/${name}`)) {
        return `./${IMAGE_DIR_NAME}/${name}`;
    }
    return name;
};

const ImagePreview = observer((props: Props) => {
    const { file } = props;
    return (
        <div className={clsx(styles.preview)}>
            <Card
                classNames={{ image: styles.img, header: styles.header }}
                image={<img src={file.downloadUrl!} />}
                header={props.showPathName ? getPathName(file) : undefined}
            ></Card>
        </div>
    );
});
export default ImagePreview;
