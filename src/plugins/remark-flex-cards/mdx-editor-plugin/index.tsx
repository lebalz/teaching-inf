/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { $getSelection, $setSelection, type LexicalEditor } from 'lexical';
import {
    activeEditor$,
    currentSelection$,
    DirectiveDescriptor,
    DirectiveEditorProps,
    insertDirective$,
    NestedLexicalEditor,
    useCellValues,
    useMdastNodeUpdater,
    usePublisher
} from '@mdxeditor/editor';
import { ContainerDirective, LeafDirective, Directives } from 'mdast-util-directive';
import { BlockContent, Paragraph, PhrasingContent, DefinitionContent } from 'mdast';
import styles from './styles.module.scss';
import clsx from 'clsx';
import {
    mdiCardTextOutline,
    mdiCheckCircleOutline,
    mdiChevronDown,
    mdiChevronRight,
    mdiCircleEditOutline,
    mdiCloseCircleOutline,
    mdiMinusBoxOutline,
    mdiPlus,
    mdiPlusBox,
    mdiPlusBoxOutline
} from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import RemoveJsxNode from '../../../components/MdxEditor/RemoveJsxNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { edit } from 'ace-builds';
import unfocusEditor from '@tdev-components/MdxEditor/helpers/lexical/unfocus-editor';
import Icon from '@mdi/react';

const isBreak = (node?: BlockContent | any): node is LeafDirective => {
    if (!node) {
        return false;
    }
    return node.type === 'leafDirective' && node.name === 'br';
};

interface ItemProps {
    isCard: boolean;
    start: number;
    end?: number;
    isEditing: boolean;
    onInsert: () => void;
    onRemove: () => void;
}
const ItemEditor = (props: ItemProps) => {
    const { isCard, start, end, isEditing } = props;
    return (
        <div className={clsx(styles.item, 'item', isCard && 'card')}>
            <div className={clsx(styles.editor, isCard ? 'card__body' : 'content')}>
                {isEditing ? (
                    <div className={clsx(styles.placeholder)}>
                        <Icon path={mdiCardTextOutline} size={3} color="var(--ifm-color-blue)" />
                    </div>
                ) : (
                    <NestedLexicalEditor<ContainerDirective>
                        block
                        getContent={(node) => {
                            const content = node.children.slice(start, end);
                            return content;
                        }}
                        getUpdatedMdastNode={(mdastNode, children) => {
                            const composed = [
                                ...mdastNode.children.slice(0, start),
                                ...children,
                                ...mdastNode.children.slice(end)
                            ] as BlockContent[];
                            return { ...mdastNode, children: composed };
                        }}
                    />
                )}
            </div>
            {isEditing && (
                <>
                    <Button
                        icon={mdiPlusBoxOutline}
                        className={clsx(styles.add)}
                        color="green"
                        onClick={props.onInsert}
                    />
                    <Button
                        icon={mdiMinusBoxOutline}
                        className={clsx(styles.remove)}
                        color="red"
                        onClick={props.onRemove}
                    />
                </>
            )}
        </div>
    );
};

export const FlexCardEditor: React.ComponentType<DirectiveEditorProps<Directives>> = ({
    mdastNode,
    lexicalNode
}) => {
    const [isEditing, setEditing] = React.useState(false);
    const updater = useMdastNodeUpdater();
    const [editor] = useLexicalComposerContext();
    const isCard = mdastNode.name === 'cards';
    const keyStart = React.useRef('A');
    const parts = React.useMemo(() => {
        const current: { start: number; key: string; end?: number }[] = [];
        mdastNode.children.forEach((child, idx) => {
            if (isBreak(child)) {
                if (current.length > 0) {
                    current[current.length - 1].end = idx;
                }
                current.push({ start: idx + 1, key: `${keyStart.current}-${idx}` });
            } else if (idx === 0) {
                current.push({ start: 0, key: `${keyStart.current}-${idx}` });
            }
        });
        current[current.length - 1].end = mdastNode.children.length;
        return current;
    }, [mdastNode.children]);
    React.useEffect(() => {
        keyStart.current = String.fromCharCode(((keyStart.current.charCodeAt(0) + 1 - 65) % 26) + 65);
    }, [parts]);

    return (
        <div className={clsx(styles.flexCard)}>
            <div className={clsx(styles.toolbar)}>
                <Button
                    icon={isEditing ? mdiCheckCircleOutline : mdiCircleEditOutline}
                    color={isEditing ? 'green' : 'orange'}
                    onClick={() => {
                        setEditing(!isEditing);
                    }}
                />
            </div>
            <div className={clsx(styles.flex, 'flex', isCard && 'flex-cards')}>
                {parts.map((part) => {
                    return (
                        <ItemEditor
                            isCard={isCard}
                            {...part}
                            isEditing={isEditing}
                            onInsert={() => {
                                editor.update(() => {
                                    const end = part.end || mdastNode.children.length;
                                    updater({
                                        children: [
                                            ...mdastNode.children.slice(0, end),
                                            { type: 'leafDirective', name: 'br' },
                                            { type: 'paragraph', children: [] },
                                            ...mdastNode.children.slice(end)
                                        ] as PhrasingContent[]
                                    });
                                });
                            }}
                            onRemove={() => {
                                editor.update(() => {
                                    updater({
                                        children: [
                                            ...mdastNode.children.slice(
                                                0,
                                                part.start - (part.start > 0 ? 1 : 0)
                                            ),
                                            ...mdastNode.children.slice(part.end)
                                        ] as PhrasingContent[]
                                    });
                                });
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const FlexDirectiveDescriptor: DirectiveDescriptor = {
    name: 'flex',
    attributes: [],
    hasChildren: true,
    testNode(node) {
        return node.name === 'flex';
    },
    Editor: FlexCardEditor
};

export const CardsDirectiveDescriptor: DirectiveDescriptor = {
    name: 'cards',
    attributes: [],
    hasChildren: true,
    testNode(node) {
        return node.name === 'cards';
    },
    Editor: FlexCardEditor
};
