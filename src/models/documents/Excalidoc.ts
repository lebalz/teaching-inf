import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';
import type { BinaryFiles } from '@excalidraw/excalidraw/types/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { default as ExcalidrawLib } from '@excalidraw/excalidraw';

export interface MetaInit {
    readonly?: boolean;
}

const DEFAULT_PLACEHOLDER_IMAGE =
    'data:image/webp;base64,UklGRqoFAABXRUJQVlA4WAoAAAAgAAAAVwIAjwEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggvAMAAFA/AJ0BKlgCkAE+bTabSaQjIqEgdNgIgA2JaW7hd2Eb89qztaTOALyE+B9XdZaMi55oOfBDVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSbJiHVUmyYh1VJsmIdVSa6ZVo9VtyyMi6j4o0Ua5hHDJAy+ufEQ2xBOOQQ1VJsmIdVSbIKUl9SDoUKYm+SQBvG9m5ayY5ctlhbnegEYPz9OCfot9PDhzNHoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry16MvEctejLxHLXoy8Ry12AAAP7/yrAAAAAAAAAAAAAAT/8bZOCyLPCGiQd0jyr1xyJGhjn3ZCc4wENWAsiSnUQBI9eugFP3jh8CWojc3ZXwoPVUb7frFVxYEr2bROq2UzZAjw5P2i3m3L8GLWFETlZdf6ceqbfiKbsKEd7pv8/OMtzjFjQQ6qUkzBiKFJz57/sHM63sgE9mo3H0/pUPqaiLIWe6RTl3kh0JRgMxDP+hodR6vVdTe+GJZEW5CAXiM7ai96zNQVdjME+rIbyzdtvM8dmXd/8zA5e6DovfKppYpMKXcbZpp13hHQjJEAz/uqgevqjeg/nSH9248z6k+f4GDMIDw4eT3IuDHhTRSWAkiXjaRk2j4CZJGsZzc3dJP52lwDY26KbMv0roHQCiAt+a+/mIZZblxTHnfp/P9L1hTKDqxQqLhCNJiRYHmquHXwdltMgfE/f8Eaf2uCKxxp6SxolrZ1WJa+gNSu9bCyYzieEIABYe6qrg6bPl7p9VnRKwV8PgyqeHg7g/gFKGYK/nEpOyhr6a2ZUzdW09AEBVhvqOZR/ROIDf1SYpwStaO7D3quRBuJb5PLBPAAAAAAAAAAAAAAAAAAAA' as const;

export class ModelMeta extends TypeMeta<DocumentType.Excalidoc> {
    readonly type = DocumentType.Excalidoc;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.Excalidoc, props.readonly ? Access.RO_User : undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.Excalidoc] {
        return {
            elements: [],
            files: {},
            image: DEFAULT_PLACEHOLDER_IMAGE
        };
    }
}

const blobToBase64 = (blob: Blob): Promise<string | null | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
};

class Excalidoc extends iDocument<DocumentType.Excalidoc> {
    @observable.ref accessor elements: readonly ExcalidrawElement[];
    @observable.ref accessor files: BinaryFiles;
    @observable.ref accessor image: string;
    constructor(props: DocumentProps<DocumentType.Excalidoc>, store: DocumentStore) {
        super(props, store);
        this.elements = props.data.elements || [];
        this.files = props.data.files || {};
        this.image = props.data.image || DEFAULT_PLACEHOLDER_IMAGE;
    }

    @action
    setData(
        data: TypeDataMapping[DocumentType.Excalidoc],
        from: Source,
        updatedAt?: Date,
        lib?: typeof ExcalidrawLib | null
    ): void {
        if (from === Source.LOCAL) {
            /**
             * Assumption:
             *  - local changes are commited only when the scene version is updated!
             *  - only non-deleted elements are commited
             */
            const updatedElements = data.elements;
            const presentFileIds = new Set(
                updatedElements.map((element) => (element.type === 'image' ? element.fileId : null))
            );
            const updatedFiles: BinaryFiles = { ...data.files };
            Object.entries(data.files).forEach(([fileId, file]) => {
                if (!presentFileIds.has(file.id)) {
                    delete updatedFiles[fileId];
                }
            });
            this.elements = updatedElements;
            this.files = updatedFiles;
            this.save(async () => {
                if (!lib) {
                    return;
                }
                return lib
                    .exportToBlob({
                        elements: updatedElements,
                        files: updatedFiles,
                        mimeType: 'image/webp',
                        quality: 0.92
                    })
                    .then((blob) => {
                        return blobToBase64(blob);
                    })
                    .then((base64String) => {
                        if (typeof base64String === 'string') {
                            this.image = base64String;
                        }
                    })
                    .catch((e) => {
                        console.warn('Failed to export excalidraw to blob', e);
                    });
            });
        } else {
            // when the changes are from the api, then throw away local history...
            // TODO: fix this, if needed
            this.elements = data.elements;
            this.files = data.files;
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.Excalidoc] {
        return {
            elements: this.elements,
            files: this.files,
            image: this.image
        };
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.Excalidoc) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default Excalidoc;
