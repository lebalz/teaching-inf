/**
 * By Mdx Editor, @url https://github.com/mdx-editor/editor/tree/main/src/plugins/image
 */

import React from 'react';
// import styles from '../../styles/ui.module.css';
import Card from '@tdev-components/shared/Card';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import ImageGallery from './ImageGallery';
import { usePublisher } from '@mdxeditor/editor';
import { insertImage$ } from '..';
import TextInput from '@tdev-components/shared/TextInput';
import ImagePreview from '@tdev-components/Cms/Github/iFile/File/ImagePreview';
import Button from '@tdev-components/shared/Button';
import { default as CmsFile } from '@tdev-models/cms/File';
import FileUpload from '@tdev-components/shared/FileUpload';
import { IMAGE_DIR_NAME } from '@tdev-models/cms/Dir';

export const ImageDialog = observer(() => {
    const [src, setSrc] = React.useState('');
    const [file, setFile] = React.useState<CmsFile | null>(null);
    const [upload, setUpload] = React.useState<File | null>(null);
    const insertImage = usePublisher(insertImage$);

    return (
        <Card
            header={<h4>Bild Einfügen</h4>}
            classNames={{ card: styles.imageDialog }}
            footer={
                <div>
                    <Button
                        onClick={() => {
                            insertImage({ src: src });
                        }}
                        text="Einfügen"
                        disabled={!src}
                        color="green"
                    />
                    {upload && (
                        <Button
                            onClick={() => {
                                insertImage({ src: src });
                            }}
                            text="Hochladen und einfügen"
                            disabled={!upload}
                            color="blue"
                        />
                    )}
                </div>
            }
        >
            <ImageGallery
                onSelect={(src, file) => {
                    setSrc(src);
                    setFile(file);
                }}
            />
            <TextInput
                label="Bild URL"
                type="url"
                onChange={(src) => {
                    setSrc(src);
                    if (file) {
                        setFile(null);
                    }
                }}
            />
            <FileUpload
                onFilesUploaded={(file) => {
                    setFile(file);
                    setSrc(`./${IMAGE_DIR_NAME}/${file.name}`);
                }}
                accept="image/*"
                description="Bilder per Drag&Drop hochladen"
            />
            {src && <ImagePreview src={file ? CmsFile.ImageDataUrl(file) : src} />}
        </Card>
    );
});
