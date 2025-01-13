import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ButtonOrDropdownButton,
    ChangeAdmonitionType,
    ChangeCodeMirrorLanguage,
    codeBlockPlugin,
    codeMirrorPlugin,
    CodeToggle,
    ConditionalContents,
    CreateLink,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    DirectiveNode,
    directivesPlugin,
    EditorInFocus,
    frontmatterPlugin,
    headingsPlugin,
    InsertCodeBlock,
    InsertFrontmatter,
    insertJsx$,
    InsertTable,
    jsxPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    NestedLexicalEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
    useLexicalNodeRemove,
    usePublisher
} from '@mdxeditor/editor';
import _ from 'lodash';
import '@mdxeditor/editor/style.css';
import File from '@tdev-models/github/File';
import { MdxJsxFlowElement } from 'mdast-util-mdx';
import {
    AdmonitionDirectiveDescriptor,
    AdmonitionKind
} from './directive-editors/AdmonitionDirectiveDescriptor';
import { BlockContent, Paragraph, RootContent } from 'mdast';
import '@mdxeditor/editor/style.css';
import { InsertAdmonition } from './toolbar/InsertAdmonition';
import BrowserWindow from '@tdev-components/BrowserWindow';
import Icon from '@mdi/react';
import { mdiClose, mdiDotsVerticalCircleOutline, mdiFormatListCheckbox } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { InsertJsxElements } from './toolbar/InsertJsxOptions';

export interface Props {
    file: File;
}

const CmsMdxEditor = observer((props: Props) => {
    const { file } = props;
    return (
        <MDXEditor
            markdown={file.refContent!}
            plugins={[
                headingsPlugin(),
                frontmatterPlugin(),
                listsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                quotePlugin(),
                directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                diffSourcePlugin({ diffMarkdown: file._pristine, viewMode: 'rich-text' }),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'py' }),
                codeMirrorPlugin({
                    codeBlockLanguages: { py: 'Python', js: 'JavaScript', css: 'CSS', bash: 'bash' }
                }),
                toolbarPlugin({
                    toolbarClassName: 'my-classname',
                    toolbarContents: () => (
                        <>
                            {' '}
                            <DiffSourceToggleWrapper>
                                <InsertTable />
                                <BoldItalicUnderlineToggles />
                                <ListsToggle />
                                <InsertCodeBlock />
                                <CreateLink />
                                <CodeToggle />
                                <BlockTypeSelect />
                                <InsertAdmonition />
                                <InsertFrontmatter />
                                <UndoRedo />
                                <ConditionalContents
                                    options={[
                                        {
                                            when: (editor) => editor?.editorType === 'codeblock',
                                            contents: () => <ChangeCodeMirrorLanguage />
                                        },
                                        {
                                            fallback: () => (
                                                <>
                                                    <InsertCodeBlock />
                                                </>
                                            )
                                        }
                                    ]}
                                />
                                <InsertJsxElements />
                            </DiffSourceToggleWrapper>
                        </>
                    )
                }),
                jsxPlugin({
                    jsxComponentDescriptors: [
                        {
                            name: 'BrowserWindow',
                            kind: 'flow',
                            hasChildren: true,
                            source: '@tdev-components/BrowserWindow',
                            defaultExport: true,
                            props: [],
                            Editor: () => {
                                return (
                                    <BrowserWindow>
                                        <NestedLexicalEditor<MdxJsxFlowElement>
                                            getContent={(node) => node.children}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            getUpdatedMdastNode={(mdastNode, children: any) => {
                                                return { ...mdastNode, children };
                                            }}
                                        />
                                    </BrowserWindow>
                                );
                            }
                        },
                        {
                            name: 'DocCardList',
                            source: '@theme/DocCardList',
                            defaultExport: true,
                            kind: 'flow',
                            hasChildren: false,
                            props: [],
                            Editor: () => {
                                const remover = useLexicalNodeRemove();
                                return (
                                    <div className="card">
                                        <div
                                            className="card__header"
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <h4>
                                                <code>{`<DocCardList />`}</code>
                                            </h4>
                                            <Button
                                                onClick={() => {
                                                    remover();
                                                }}
                                                icon={mdiClose}
                                            />
                                        </div>
                                        <div className="card__body" style={{ justifySelf: 'center' }}>
                                            <Icon
                                                path={mdiFormatListCheckbox}
                                                size={3}
                                                color="var(--ifm-color-primary)"
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        }
                    ]
                })
            ]}
            onChange={(md) => {
                file.setContent(md);
            }}
        />
    );
});

export default CmsMdxEditor;
