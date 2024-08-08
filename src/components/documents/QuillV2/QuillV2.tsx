import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { default as QuillV2Model, MetaInit, ModelMeta } from '@site/src/models/documents/QuillV2';
import { useQuill } from 'react-quilljs';
import { ToolbarOptions } from '@site/src/models/documents/QuillV2/helpers/toolbar';
import 'quill/dist/quill.snow.css'; // Add css for snow theme
import 'quill/dist/quill.bubble.css'; // Add css for snow theme
import BaseImageFormat from 'quill/formats/image';
import { downscaleImage } from './quill-img-compress/downscaleImage';
import { file2b64 } from './quill-img-compress/file2b64';
import dropImage from './quill-img-compress/dropImage';
import pasteImage from './quill-img-compress/pasteImage';
import ResizeModule from '@botom/quill-resize-module';
import styles from './styles.module.scss';
import clsx from 'clsx';
import SyncStatus from '../../SyncStatus';
import { action } from 'mobx';

export interface Props extends MetaInit {
    id: string;
    style?: React.CSSProperties;
    readonly?: boolean;
    monospace?: boolean;
    default?: string;
    toolbar?: ToolbarOptions;
    toolbarExtra?: ToolbarOptions;
    placeholder?: string;
    theme?: 'snow' | 'bubble';
    quillDocument: QuillV2Model;
}

const FORMATS = [
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'list',
    'indent',
    'size',
    'header',
    'link',
    'image',
    'color',
    'background',
    'code-block',
    'indent',
    'blockquote',
    'script',
    'code'
    // 'width',
    // 'clean',
    // 'style',
    // 'video'
];

const QuillV2 = observer((props: Props) => {
    const doc = props.quillDocument;
    const mounted = React.useRef(false);
    const updateSource = React.useRef<'current' | undefined>(undefined);
    const [processingImage, setProcessingImage] = React.useState(false);
    const [showQuillToolbar, setShowQuillToolbar] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const [theme] = React.useState(props.theme || 'snow');
    const { quill, quillRef, Quill } = useQuill({
        theme: theme,
        modules: {
            toolbar: doc.meta.toolbar,
            resize: {
                showSize: false,
                toolbar: {
                    alingTools: true,
                    sizeTools: false
                },
                locale: {
                    altTip: 'Alt-Taste gedrückt halten, um das Seitenverhältnis beizubehalten',
                    floatLeft: '',
                    floatRight: '',
                    center: '',
                    restore: ''
                }
            }
        },
        formats: FORMATS,
        placeholder: props.placeholder || '✍️ Antwort...',
        readOnly: props.readonly
    });

    // Insert Image(selected by user) to quill
    const insertToEditor = (url: string) => {
        if (!mounted.current || !quill) {
            return;
        }
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', url);
        range.index++;
        quill.setSelection(range, 'api');
        // add new line
        quill.insertText(range.index, '\n');
        range.index++;
        quill.setSelection(range, 'api');
    };

    const insertImage = async (img?: string) => {
        if (!img) {
            return setProcessingImage(false);
        }
        downscaleImage(img)
            .then((img) => {
                insertToEditor(img);
            })
            .catch(() => {
                console.log('Could not insert image');
            })
            .finally(() => {
                if (mounted.current) {
                    setProcessingImage(false);
                }
            });
    };

    // Open Dialog to select Image File
    const selectLocalImage = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*,image/heic,image/heif');
        input.onchange = () => {
            if (!input.files || input.files.length < 1) {
                return;
            }
            const file = input.files[0];
            setProcessingImage(true);
            file2b64(file).then(insertImage);
        };
        input.click();
    };

    const dropHandler = (event: DragEvent) => {
        setProcessingImage(true);
        dropImage(event).then(insertImage);
    };

    const pasteHandler = (event: ClipboardEvent) => {
        setProcessingImage(true);
        pasteImage(event).then(insertImage);
    };

    React.useEffect(() => {
        if (quill) {
            quill.setContents(doc.delta);
            const saveHandeler = action(() => {
                updateSource.current = 'current';
                doc.setDelta(quill.getContents());
            });
            quill.on('text-change', saveHandeler);
            quill.keyboard.addBinding({
                key: 's',
                shortKey: true,
                handler: action(function () {
                    doc.saveNow();
                })
            });

            return () => {
                if (doc.isDirty) {
                    saveHandeler();
                }

                quill.off('text-change', saveHandeler);
                delete quill.keyboard.bindings['s'];
            };
        }
    }, [quill, updateSource]);

    React.useEffect(() => {
        const onQuillToolbarMouseDown = (e: any) => {
            e.preventDefault();
        };
        if (quill) {
            (quill.getModule('toolbar') as any).addHandler('image', selectLocalImage);
            quill.root.addEventListener('drop', dropHandler);
            quill.root.addEventListener('paste', pasteHandler);
            (quill.getModule('toolbar') as any).container.addEventListener(
                'mousedown',
                onQuillToolbarMouseDown
            );
        }
        return () => {
            if (quill) {
                (quill.getModule('toolbar') as any).container.removeEventListener(
                    'mousedown',
                    onQuillToolbarMouseDown
                );
            }
        };
    }, [quill]);

    React.useEffect(() => {
        if (!doc) {
            return;
        }
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        if (!quill) {
            return;
        }

        /**
         * Do not update the quill editor if the change was made by the current quill component
         */
        const source = updateSource.current;
        updateSource.current = undefined;
        if (source === 'current') {
            return;
        }

        quill.setContents(doc.delta, 'silent');
    }, [quill, doc.delta, updateSource]);

    React.useEffect(() => {
        if (Quill && !quill) {
            /**
             * ensure these attributes are present in the formats object
             * and are be persisted to the delta
             */
            class ImageFormat extends BaseImageFormat {
                static formats(domNode: Element) {
                    const formats: { [key: string]: string } = {};
                    ['alt', 'height', 'width', 'style'].forEach((attribute) => {
                        if (domNode.hasAttribute(attribute)) {
                            formats[attribute] = domNode.getAttribute(attribute)!;
                        }
                    });
                    return formats;
                }
                format(name: string, value: string) {
                    if (['alt', 'height', 'width', 'style'].includes(name)) {
                        if (value) {
                            this.domNode.setAttribute(name, value);
                        } else {
                            this.domNode.removeAttribute(name);
                        }
                    } else {
                        super.format(name, value);
                    }
                }
            }

            Quill.register(ImageFormat, true);
            (window as any).Quill = Quill;
            /* Quill register method signature is => static register(path, target, overwrite = false)
            Set overwrite to true to avoid warning
            https://github.com/quilljs/quill/issues/2559#issuecomment-945605414 */
            Quill.register('modules/resize', ResizeModule, true);
        }
    }, [quill, Quill]);

    return (
        <div
            className={clsx(styles.quillEditor, styles.quill, 'notranslate')}
            onFocus={() => !showQuillToolbar && setShowQuillToolbar(true)}
            onBlur={() => {
                updateSource.current = undefined;
            }}
            ref={ref}
        >
            <div
                className={clsx(
                    'quill-editor-container',
                    styles.quillAnswer,
                    props.monospace && styles.monospace,
                    !showQuillToolbar && styles.disableToolbar
                )}
                // style={{ display: mounted.current ? undefined : 'none', ...(props.style || {}) }}
            >
                <div ref={quillRef} />
                {processingImage && <Loader label="Bild Einfügen..." overlay />}
                <SyncStatus model={doc} className={styles.saveIndicator} />
            </div>
        </div>
    );
});

export default QuillV2;
