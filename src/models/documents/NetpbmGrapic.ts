import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';
import { parse } from '@tdev-components/documents/NetpbmEditor/parser/parser';
import { ParserResult } from '@tdev-components/documents/NetpbmEditor/types';

export interface MetaInit {
    readonly?: boolean;
    default?: string;
    children?: React.ReactNode;
}

export class ModelMeta extends TypeMeta<DocumentType.NetpbmGraphic> {
    readonly type = DocumentType.NetpbmGraphic;
    readonly readonly?: boolean;
    readonly default?: string;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.NetpbmGraphic, props.readonly ? Access.RO_User : undefined);
        /**
         * the default data can be either provided as a string or as a child element.
         * If it is provided as a child element, the relevant data is extracted.
         * - inline-text: the default data is provided as a string (<NetpbmGraphic>data</NetpbmGraphic>)
         * - children: the default data is provided as a child element - because mdx would parse and transform it
         *             to paragraphs, the content is provided in a code-block. Thus expect it as the child of the first child.
         * @example
         * <NetpbmGraphic>
         *   ```
         *   P1
         *   2 4
         *   1 0
         *   0 1
         *   ```
         * </NetpbmGraphic>
         */
        const childData: string | undefined = props.children
            ? typeof props.children === 'string'
                ? props.children // inline-text
                : Array.isArray(props.children) // expectation: the relevant data is provided
                  ? //    code-block     >    it's first child contains the text
                    props.children[0]?.props?.children?.props?.children
                  : undefined
            : undefined;
        this.readonly = props.readonly;
        this.default = childData || props.default;
    }

    get defaultData(): TypeDataMapping[DocumentType.NetpbmGraphic] {
        return {
            imageData: this.default || ''
        };
    }
}

class NetpbmGraphic extends iDocument<DocumentType.NetpbmGraphic> {
    @observable accessor imageData: string;
    constructor(props: DocumentProps<DocumentType.NetpbmGraphic>, store: DocumentStore) {
        super(props, store);
        this.imageData = props.data?.imageData || '';
    }

    @action
    setData(data: TypeDataMapping[DocumentType.NetpbmGraphic], from: Source, updatedAt?: Date): void {
        this.imageData = data.imageData;
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    @computed
    get sanitizedData(): string {
        return this.imageData
            .trim()
            .split('\n')
            .filter((line) => !line.trim().startsWith('#')) // Remove comments.
            .join('\n');
    }

    @computed
    get parserResult(): ParserResult {
        return parse(this.sanitizedData);
    }

    @computed
    get errors() {
        return this.parserResult.errors || [];
    }

    @computed
    get warnings() {
        return this.parserResult.warnings || [];
    }

    @computed
    get hasWarnings() {
        return this.warnings.length > 0;
    }

    @computed
    get hasErrors() {
        return this.errors.length > 0;
    }

    @computed
    get hasErrorsOrWarnings() {
        return this.hasErrors || this.hasWarnings;
    }

    @computed
    get config() {
        return this.parserResult.config;
    }

    @computed
    get width() {
        return this.config.width;
    }

    @computed
    get height() {
        return this.config.height;
    }

    @computed
    get pixels() {
        return this.parserResult.imageData?.pixels;
    }

    @action
    format() {
        const { maxValue } = this.config;
        console.log('maxValue', maxValue, this.config);
        if (!maxValue) {
            return;
        }
        const sz = `${maxValue}`.length;
        const lines = this.imageData.split('\n');
        const firstLineRegex = new RegExp(`^\\s*${maxValue}(?:\\s+|$)`);
        const commentRegex = /^\s*#/;
        const firstDataLine = lines.findIndex((l) => firstLineRegex.test(l));
        if (firstDataLine === -1) {
            return;
        }
        const data = lines.slice(firstDataLine).map((l) => {
            if (commentRegex.test(l)) {
                return l.trim();
            }
            return l
                .split(/\s+/)
                .map((v) => {
                    return v.padStart(sz, ' ');
                })
                .join(' ')
                .trim();
        });
        const formatted = [...lines.slice(0, firstDataLine), ...data].join('\n');
        this.setData({ imageData: formatted }, Source.LOCAL);
    }

    get data(): TypeDataMapping[DocumentType.NetpbmGraphic] {
        return {
            imageData: this.imageData
        };
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.NetpbmGraphic) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default NetpbmGraphic;
