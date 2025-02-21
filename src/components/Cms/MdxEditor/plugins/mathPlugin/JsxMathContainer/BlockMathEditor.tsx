import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { Math, InlineMath as MdastNodeInlineMath } from 'mdast-util-math';
import { BlockMath, InlineMath as KatexInline } from 'react-katex';
import Popup from 'reactjs-popup';
import Card from '@tdev-components/shared/Card';
import TextInput from '@tdev-components/shared/TextInput';
import Button, { ButtonIcon } from '@tdev-components/shared/Button';
import { useMdastNodeUpdater } from '@mdxeditor/editor';
import { PopupActions } from 'reactjs-popup/dist/types';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeEditor from '@tdev-components/shared/CodeEditor';

interface Props {
    mdastNode: Math;
}

const BlockMathEditor = (props: Props) => {
    const { mdastNode } = props;
    const [value, setValue] = React.useState(mdastNode.value);
    const updateMdastNode = useMdastNodeUpdater();
    return (
        <Tabs className={clsx(styles.tabs)} groupId="katex-editor">
            <TabItem value="math" label="Math">
                <BlockMath>{mdastNode.value}</BlockMath>
            </TabItem>
            <TabItem value="latex" label="Latex">
                <CodeEditor
                    lang="tex"
                    defaultValue={mdastNode.value}
                    onChange={(value) => {
                        updateMdastNode({ value: value });
                    }}
                />
            </TabItem>
        </Tabs>
    );
};

export default BlockMathEditor;
