import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
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
    InsertTable,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo
} from '@mdxeditor/editor';
import _ from 'lodash';
import '@mdxeditor/editor/style.css';
import File from '@tdev-models/github/File';
import {
    AdmonitionDirectiveDescriptor,
    AdmonitionKind
} from './directive-editors/AdmonitionDirectiveDescriptor';
import { BlockContent, Paragraph, RootContent } from 'mdast';
import '@mdxeditor/editor/style.css';
import { InsertAdmonition } from './toolbar/InsertAdmonition';

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
                            </DiffSourceToggleWrapper>
                        </>
                    )
                })
            ]}
            onChange={(md) => {
                file.setContent(md);
            }}
        />
    );
});

export default CmsMdxEditor;
