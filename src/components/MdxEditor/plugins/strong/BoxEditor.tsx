import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { NestedLexicalEditor } from '@mdxeditor/editor';
import { PhrasingContent, Strong } from 'mdast';
interface Props {}

const BoxEditor = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');

    return (
        <span className={clsx(styles.boxEditor)}>
            <NestedLexicalEditor<Strong>
                block={false}
                getContent={(node) => {
                    return node.children || [];
                }}
                contentEditableProps={{
                    className: styles.boxed
                }}
                getUpdatedMdastNode={(mdastNode, children) => {
                    return {
                        type: 'strong',
                        children: children as PhrasingContent[],
                        data: {
                            hProperties: {
                                class: 'boxed'
                            }
                        }
                    };
                }}
            />
        </span>
    );
});

export default BoxEditor;
