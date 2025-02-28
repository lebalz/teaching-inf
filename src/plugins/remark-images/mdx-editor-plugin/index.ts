/**
 * By Mdx Editor, @url https://github.com/mdx-editor/editor/tree/main/src/plugins/image
 */

import { $wrapNodeInElement, CAN_USE_DOM, mergeRegister } from '@lexical/utils';
import { $convertToMarkdownString } from '@lexical/markdown';
import { Cell, Signal, withLatestFrom } from '@mdxeditor/gurx';
import {
    $createParagraphNode,
    $createRangeSelection,
    $getSelection,
    $insertNodes,
    $isNodeSelection,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    LexicalCommand,
    LexicalEditor,
    PASTE_COMMAND,
    createCommand
} from 'lexical';
import {
    LexicalImageCaptionVisitor,
    LexicalImageFigureVisitor,
    LexicalImageVisitor
} from './LexicalImageVisitor';
import {
    activeEditor$,
    addExportVisitor$,
    addImportVisitor$,
    addLexicalNode$,
    addMdastExtension$,
    createActiveEditorSubscription$,
    realmPlugin
} from '@mdxeditor/editor';
import { $createImageNode, $isImageNode, CreateImageNodeParameters, ImageNode } from './ImageNode';
import { MdastImageCaptionVisitor, MdastImageFigureVisitor, MdastImageVisitor } from './MdastImageVisitor';
import React from 'react';
import { rootStore } from '@tdev/stores/rootStore';
import type { Parent, PhrasingContent, Root, Image } from 'mdast';
import { transformer } from '../transformer';
import { transformer as strongTransformer } from '@tdev-plugins/remark-strong/plugin';
import { $createImageCaptionNode, ImageCaptionNode } from './ImageCaptionNode';
import { $createImageFigureNode, ImageFigureNode, SerializedImageFigureNode } from './ImageFigureNode';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { directive } from 'micromark-extension-directive';
export * from './ImageNode';

export interface ImageCaption extends Parent {
    type: 'imageCaption';
    children: PhrasingContent[];
}
export interface ImageFigure extends Parent {
    type: 'imageFigure';
    children: [Image, ImageCaption];
}
declare module 'mdast' {
    interface RootContentMap {
        imageCaption: ImageCaption;
        imageFigure: ImageFigure;
    }
}

/**
 * @group Image
 */
export type ImageUploadHandler = ((image: File) => Promise<string>) | null;

/**
 * @group Image
 */
export type ImagePreviewHandler = ((imageSource: string) => Promise<string>) | null;

interface BaseImageParameters {
    altText?: string;
    title?: string;
}

/**
 * @group Image
 */
export interface FileImageParameters extends BaseImageParameters {
    file: File;
}

/**
 * @group Image
 */
export interface SrcImageParameters extends BaseImageParameters {
    src: string;
}
/**
 * @group Image
 */
export type InsertImageParameters = FileImageParameters | SrcImageParameters;

/**
 * @group Image
 */
export interface SaveImageParameters extends BaseImageParameters {
    src?: string;
    file: FileList;
}

const internalInsertImage$ = Signal<SrcImageParameters>((r) => {
    r.sub(r.pipe(internalInsertImage$, withLatestFrom(activeEditor$)), ([values, theEditor]) => {
        theEditor?.update(() => {
            const imageFigure = $createImageFigureNode();
            const imageNode = $createImageNode({
                altText: values.altText ?? '',
                src: values.src
            });
            const imageCaption = $createImageCaptionNode();
            imageFigure.append(imageNode, imageCaption);

            $insertNodes([imageFigure]);
            if ($isRootOrShadowRoot(imageFigure.getParentOrThrow())) {
                $wrapNodeInElement(imageFigure, $createParagraphNode).selectEnd();
            }
        });
    });
});

/**
 * A signal that inserts a new image node with the published payload.
 * @group Image
 */
export const insertImage$ = Signal<InsertImageParameters>((r) => {
    r.sub(r.pipe(insertImage$, withLatestFrom(imageUploadHandler$)), ([values, imageUploadHandler]) => {
        const handler = (src: string) => {
            r.pub(internalInsertImage$, { ...values, src });
        };

        if ('file' in values) {
            imageUploadHandler?.(values.file)
                .then(handler)
                .catch((e: unknown) => {
                    throw e;
                });
        } else {
            handler(values.src);
        }
    });
});
/**
 * Holds the autocomplete suggestions for image sources.
 * @group Image
 */
export const imageAutocompleteSuggestions$ = Cell<string[]>([]);

/**
 * Holds the disable image resize configuration flag.
 * @group Image
 */
export const disableImageResize$ = Cell<boolean>(false);

/**
 * Holds the image upload handler callback.
 * @group Image
 */
export const imageUploadHandler$ = Cell<ImageUploadHandler>(null);

/**
 * Holds the image preview handler callback.
 * @group Image
 */
export const imagePreviewHandler$ = Cell<ImagePreviewHandler>(null);

export const disableImageSettingsButton$ = Cell<boolean>(false);

/**
 * Saves the data from the image dialog
 * @group Image
 */
export const saveImage$ = Signal<SaveImageParameters>();

/**
 * A plugin that adds support for images.
 * @group Image
 */
export const imagePlugin = realmPlugin<{
    imageUploadHandler?: ImageUploadHandler;
    imageAutocompleteSuggestions?: string[];
    disableImageResize?: boolean;
    disableImageSettingsButton?: boolean;
    imagePreviewHandler?: ImagePreviewHandler;
    ImageDialog?: (() => React.ReactNode) | React.FC;
}>({
    init(realm, params) {
        realm.pubIn({
            [addImportVisitor$]: [MdastImageFigureVisitor, MdastImageVisitor, MdastImageCaptionVisitor],
            [addLexicalNode$]: [ImageNode, ImageFigureNode, ImageCaptionNode],
            [addExportVisitor$]: [LexicalImageFigureVisitor, LexicalImageCaptionVisitor, LexicalImageVisitor],
            [imageUploadHandler$]: params?.imageUploadHandler ?? null,
            [disableImageResize$]: Boolean(params?.disableImageResize),
            [disableImageSettingsButton$]: Boolean(params?.disableImageSettingsButton),
            [imagePreviewHandler$]: params?.imagePreviewHandler ?? null,
            [addMdastExtension$]: [
                {
                    name: 'images-plugin',
                    transforms: [
                        (ast: Root) => {
                            const editedFile = rootStore.cmsStore.editedFile;
                            transformer(ast, editedFile?.type === 'file' ? editedFile.content : '', {
                                cleanAltText: false,
                                caption: (rawCaption, options) => {
                                    const captionAst = fromMarkdown(rawCaption, 'utf-8', {
                                        extensions: [directive()],
                                        mdastExtensions: [
                                            {
                                                transforms: [
                                                    (ast: Root) => {
                                                        strongTransformer(ast, rawCaption, (children) => ({
                                                            type: 'box',
                                                            children: children
                                                        }));
                                                    }
                                                ]
                                            },
                                            directiveFromMarkdown()
                                        ]
                                    });

                                    const children = rawCaption ? captionAst.children : [];

                                    /**
                                     * Add alt as caption
                                     */
                                    const caption = {
                                        type: 'imageCaption',
                                        children: children
                                    } as ImageCaption;
                                    return caption;
                                },
                                figure: (children, options) => {
                                    return {
                                        type: 'imageFigure',
                                        children: children
                                    };
                                },
                                merge: (figure, caption) => {
                                    figure.children.splice(figure.children.length, 0, caption as any);
                                    return figure;
                                }
                            });
                        }
                    ]
                }
            ]
        });
    },

    update(realm, params) {
        realm.pubIn({
            [imageUploadHandler$]: params?.imageUploadHandler ?? null,
            [disableImageResize$]: Boolean(params?.disableImageResize),
            [imagePreviewHandler$]: params?.imagePreviewHandler ?? null
        });
    }
});

// currently, drag and drop is not supported...
