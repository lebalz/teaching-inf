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
import ImagePreview from '@tdev-components/Cms/Github/iFile/File/FilePreview/ImagePreview';
import Button from '@tdev-components/shared/Button';
import FileUpload from '@tdev-components/shared/FileUpload';
import clsx from 'clsx';
import { Asset } from '@tdev-models/cms/Dir';
import BinFile from '@tdev-models/cms/BinFile';
import AssetSelector from '@tdev-components/Cms/MdxEditor/AssetSelector';
import FileStub from '@tdev-models/cms/FileStub';
import iFile from '@tdev-models/cms/iFile';
import { useStore } from '@tdev-hooks/useStore';

interface Props {
    onClose: () => void;
}

export const ImageDialog = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const [src, setSrc] = React.useState('');
    const [file, setFile] = React.useState<BinFile | null>(null);
    const [cleanSrc, setCleanSrc] = React.useState(0);
    const insertImage = usePublisher(insertImage$);
    const { activeEntry } = cmsStore;
    if (!activeEntry) {
        return null;
    }

    return (
        <Card
            header={<h4>Bild Einfügen</h4>}
            classNames={{
                card: styles.imageDialog,
                body: styles.body,
                image: styles.preview,
                footer: styles.footer
            }}
            footer={
                <>
                    <Button onClick={props.onClose} text="Abbrechen" />
                    <Button
                        color="orange"
                        disabled={!src}
                        onClick={() => {
                            setSrc('');
                            setFile(null);
                            setCleanSrc((prev) => prev + 1);
                        }}
                        text="Entfernen"
                    />
                    <Button
                        onClick={() => {
                            insertImage({ src: src });
                            props.onClose();
                        }}
                        text="Einfügen"
                        disabled={!src}
                        color="green"
                    />
                </>
            }
            image={
                src ? (
                    <img
                        title="Ausgewähltes Bild"
                        className={clsx(styles.previewImage)}
                        src={file ? file.src : src}
                    />
                ) : null
            }
        >
            <AssetSelector
                onSelect={(selected) => {
                    console.log('Selected', selected.path, file?.relativePath(selected));
                    const src = activeEntry.relativePath(selected);
                    setSrc(src);
                    setFile(selected as BinFile);
                    setCleanSrc((prev) => prev + 1);
                }}
                filter={(entry): entry is BinFile => {
                    return entry.isImage;
                }}
            />
            <TextInput
                label="Bild URL"
                type="url"
                key={cleanSrc}
                onChange={(src) => {
                    setSrc(src);
                    if (file) {
                        setFile(null);
                    }
                }}
            />
            <FileUpload
                onFilesUploaded={(file) => {
                    insertImage({ src: `./${Asset.IMAGE}/${file.name}` });
                    props.onClose();
                }}
                accept="image/*"
                description="Bilder per Drag&Drop hochladen"
            />
        </Card>
    );
});
