/**
 * By Mdx Editor, @url https://github.com/mdx-editor/editor/tree/main/src/plugins/image
 */

import React from 'react';
// import styles from '../../styles/ui.module.css';
import Card from '@tdev-components/shared/Card';
import { useStore } from '@tdev-hooks/useStore';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import ImageGallery from './ImageGallery';
import { usePublisher } from '@mdxeditor/editor';
import { insertImage$, saveImage$ } from '..';

interface ImageFormFields {
    src: string;
    title: string;
    altText: string;
    file: FileList;
}
export const ImageDialog = observer(() => {
    const cmsStore = useStore('cmsStore');
    const insertImage = usePublisher(insertImage$);

    return (
        <Card header={<h4>Bild Einfügen</h4>} classNames={{ card: styles.imageDialog }}>
            <ImageGallery
                onSelect={(src) => {
                    insertImage({ src: src });
                }}
            />
        </Card>
    );
});
