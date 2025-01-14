import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ChangeCodeMirrorLanguage,
    codeBlockPlugin,
    codeMirrorPlugin,
    CodeToggle,
    ConditionalContents,
    CreateLink,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    directivesPlugin,
    frontmatterPlugin,
    headingsPlugin,
    InsertCodeBlock,
    InsertFrontmatter,
    InsertTable,
    jsxPlugin,
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
import { AdmonitionDirectiveDescriptor } from './JsxPluginDescriptors/directive-editors/AdmonitionDescriptor';
import '@mdxeditor/editor/style.css';
import { InsertAdmonition } from './toolbar/InsertAdmonition';
import { InsertJsxElements } from './toolbar/InsertJsxOptions';
import BrowserWindowDescriptor from './JsxPluginDescriptors/BrowserWindowDescriptor';
import DocCardListDescriptor from './JsxPluginDescriptors/DocCardListDescriptor';
import { MdiDescriptor } from './JsxPluginDescriptors/directive-editors/MdiDescriptor';

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
                directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor, MdiDescriptor] }),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                diffSourcePlugin({ diffMarkdown: file._pristine, viewMode: 'rich-text' }),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'py' }),
                codeMirrorPlugin({
                    codeBlockLanguages: {
                        py: 'Python',
                        js: 'JavaScript',
                        css: 'CSS',
                        bash: 'bash',
                        ['mdx-code-block']: 'mdx-code-block'
                    }
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
                    jsxComponentDescriptors: [BrowserWindowDescriptor, DocCardListDescriptor]
                })
            ]}
            onChange={(md) => {
                file.setContent(md);
            }}
        />
    );
});

export default CmsMdxEditor;
