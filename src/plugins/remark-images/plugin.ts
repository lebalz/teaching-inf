import { visit, SKIP, CONTINUE } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import { BlockContent, Image, Paragraph, Parent, PhrasingContent, Root, RootContent, Text } from 'mdast';
import path from 'path';
import { promises as fs } from 'fs';
import { cleanedText, ParsedOptions, parseOptions, toJsxAttribute } from '../helpers';
import clsx from 'clsx';

const DEFAULT_TAG_NAMES = {
    figure: 'span',
    figcaption: 'span',
    sourceRef: 'SourceRef'
};

export type CaptionVisitor = (captionAst: Parent, rawCaption: string) => void;

interface OptionsInput {
    tagNames?: {
        figure?: string;
        figcaption?: string;
        sourceRef?: string;
    };
    inlineEmptyCaptions?: boolean;
    captionVisitors?: CaptionVisitor[];
}

const SPACER_SPAN = {
    type: 'mdxJsxTextElement',
    name: 'span',
    attributes: [toJsxAttribute('style', { flexGrow: 1 })],
    children: []
} as MdxJsxTextElement;

const trimText = (nodes: PhrasingContent[], location: 'start' | 'end') => {
    const textNode = nodes[location === 'start' ? 0 : nodes.length - 1];
    if (textNode.type === 'text') {
        if (location === 'start') {
            textNode.value = textNode.value.trimStart();
        } else {
            textNode.value = textNode.value.trimEnd();
        }
    }
    return nodes;
};

const unshiftImagesFromParagraphs = (ast: Root) => {
    visit(ast, 'paragraph', (node, idx, parent) => {
        if (!parent || idx === undefined) {
            return;
        }
        const imageIndex = node.children.findIndex((n) => n.type === 'image');
        if (imageIndex >= 0) {
            const image = node.children.splice(imageIndex, 1)[0] as Image;
            if (/@inline/.test(image.alt || '')) {
                node.children.splice(imageIndex, 0, image);
                return CONTINUE;
            }
            if (node.children.length === 0) {
                parent.children.splice(idx, 1, image);
            } else if (imageIndex === 0) {
                /** was the first child */
                trimText(node.children, 'start');
                const first = node.children[0];
                if (first?.type === 'text' && first.value.length === 0) {
                    node.children.shift();
                }
                parent.children.splice(idx, 0, image as any as BlockContent);
            } else if (imageIndex === node.children.length) {
                /** was the last child */
                trimText(node.children, 'end');
                const last = node.children[node.children.length - 1];
                if (last?.type === 'text' && last.value.length === 0) {
                    node.children.pop();
                }
                parent.children.push(image as any as BlockContent);
            } else {
                const preChildren = node.children.splice(0, imageIndex);
                trimText(preChildren, 'end');
                const postChildren = node.children.slice();
                trimText(postChildren, 'start');
                let spliceTo = idx;
                if (preChildren.some((n) => n.type !== 'text' || n.value.length > 0)) {
                    parent.children.splice(spliceTo, 0, {
                        children: preChildren.filter((n) => n.type !== 'text' || n.value.length > 0),
                        type: 'paragraph'
                    });
                    spliceTo++;
                }
                parent.children.splice(spliceTo, 1, image);
                spliceTo++;
                if (postChildren.some((n) => n.type !== 'text' || n.value.length > 0)) {
                    parent.children.splice(spliceTo, 0, {
                        children: postChildren.filter((n) => n.type !== 'text' || n.value.length > 0),
                        type: 'paragraph'
                    });
                    spliceTo++;
                }
            }
        }
    });
};

interface Config {
    bibContent?: string;
    figure: (children: RootContent[] | PhrasingContent[], options: ParsedOptions) => MdxJsxFlowElement;
    caption: (rawCaption: string, options: ParsedOptions) => MdxJsxTextElement;
    bib: (imgSrc: string) => Promise<MdxJsxTextElement | undefined>;
    merge: (
        figure: MdxJsxFlowElement,
        caption: MdxJsxTextElement,
        bib?: MdxJsxTextElement
    ) => MdxJsxFlowElement;
}

const transformer = (ast: Root, content: string, config: Config) => {
    unshiftImagesFromParagraphs(ast);
    const bibPromises = [] as Promise<any>[];
    visit(ast, 'image', (node, idx, parent) => {
        if (!parent) {
            return;
        }
        const line = (node.position?.start?.line || 1) - 1;
        const raw = content
            .split('\n')
            [line].slice((node.position?.start?.column || 1) - 1, node.position?.end?.column || 0);
        const rawCaption = raw.slice(2).replace(`](${node.url})`, '');
        /** get image options and set cleaned alt text */
        const cleanedAlt = cleanedText(rawCaption || '');
        const options = parseOptions(rawCaption || '', true);
        const className = (options as any).className as string | undefined;
        delete (options as any).className;
        const isInline = /@inline/.test(node.alt || '') && parent.type === 'paragraph';
        if (isInline) {
            node.alt = cleanedText(node.alt || '').replace(/@inline/, '');
            return SKIP;
        }
        node.alt = cleanedText(node.alt || '');
        const figure = config.figure([node], options);
        const caption = config.caption(cleanedAlt, options);
        const promise = config.bib(node.url).then((bib) => {
            const imgNode = config.merge(figure, caption, bib);
            parent.children.splice(idx || 0, 1, imgNode);
        });
        bibPromises.push(promise);
    });
    return Promise.all(bibPromises);
};

const plugin: Plugin<OptionsInput[], Root> = function plugin(
    this,
    optionsInput = { tagNames: DEFAULT_TAG_NAMES }
): Transformer<Root> {
    return async (ast, vfile) => {
        const dir = path.dirname(vfile.history[0] || '');
        await transformer(ast, vfile.value.toString(), {
            bib: async (imgSrc) => {
                const ext = path.extname(imgSrc);
                const bibFile = path.resolve(dir, imgSrc.replace(new RegExp(`${ext}$`), '.json'));
                const hasBibFile = await fs
                    .stat(bibFile)
                    .then(() => true)
                    .catch(() => false);
                if (hasBibFile) {
                    const bibContent = await import(bibFile)
                        .then(({ default: bib }) => bib)
                        .catch((err) => {
                            console.warn('Invalid bib file', bibFile, err);
                        });
                    if (!bibContent) {
                        return;
                    }
                    const bibNode = {
                        type: 'mdxJsxTextElement',
                        name: optionsInput?.tagNames?.sourceRef || DEFAULT_TAG_NAMES.sourceRef,
                        attributes: [toJsxAttribute('bib', bibContent)],
                        children: []
                    } as MdxJsxTextElement;
                    return bibNode;
                }
            },
            caption: (rawCaption, options) => {
                const { inlineCaption = false } = options;
                const { inlineEmptyCaptions = true } = optionsInput;
                const captionEmpty = /^\s*$/.test(rawCaption);
                /**
                 * Add alt as caption
                 */
                const caption = {
                    type: 'mdxJsxTextElement',
                    name: optionsInput?.tagNames?.figcaption || DEFAULT_TAG_NAMES.figcaption,
                    attributes: [
                        toJsxAttribute(
                            'className',
                            clsx(
                                'caption',
                                (inlineCaption || (captionEmpty && inlineEmptyCaptions)) && 'inline'
                            )
                        )
                    ],
                    children: []
                } as MdxJsxTextElement;

                if (rawCaption) {
                    const altAst = this.parse(rawCaption) as Parent;
                    if (optionsInput?.captionVisitors) {
                        optionsInput.captionVisitors.forEach((visitor) => visitor(altAst, rawCaption));
                    }
                    /* flatten paragraphs by only using their child nodes */
                    const altNodes = altAst.children.flatMap((n) =>
                        n.type === 'paragraph' ? n.children : (n as PhrasingContent)
                    );
                    caption.children = [SPACER_SPAN, ...altNodes, SPACER_SPAN];
                }
                return caption;
            },
            figure: (children, options) => {
                return {
                    type: 'mdxJsxFlowElement',
                    name: optionsInput?.tagNames?.figure || DEFAULT_TAG_NAMES.figure,
                    attributes: [
                        toJsxAttribute('className', clsx('figure', options.className)),
                        ...(Object.keys(options).length > 0 ? [toJsxAttribute('options', options)] : [])
                    ],
                    children: children
                } as MdxJsxFlowElement;
            },
            merge: (figure, caption, bib) => {
                if (bib) {
                    if (caption.children.length === 0) {
                        caption.children.splice(caption.children.length, 0, SPACER_SPAN);
                    }
                    caption.children.splice(caption.children.length, 0, bib);
                }
                if (caption.children.length > 0) {
                    figure.children.splice(figure.children.length, 0, caption as any);
                }
                return figure;
            }
        });
    };
};

export default plugin;
