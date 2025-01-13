import React from 'react';
import { observer } from 'mobx-react-lite';
import type * as MdxEditorLib from '@mdxeditor/editor';
import _ from 'lodash';
import { useClientLib } from '@tdev-hooks/useClientLib';
import '@mdxeditor/editor/style.css';
import File from '@tdev-models/github/File';

export interface Props {
    file: File;
}

const MdxEditor = observer((props: Props) => {
    const Lib = useClientLib<typeof MdxEditorLib>(() => import('@mdxeditor/editor'), '@mdxeditor/editor');
    const { file } = props;
    if (!Lib) {
        return null;
    }
    return (
        <Lib.MDXEditor
            markdown={file.refContent!}
            plugins={[
                Lib.headingsPlugin(),
                Lib.frontmatterPlugin(),
                Lib.listsPlugin(),
                Lib.linkPlugin(),
                Lib.linkDialogPlugin(),
                Lib.quotePlugin(),
                Lib.directivesPlugin({ directiveDescriptors: [Lib.AdmonitionDirectiveDescriptor] }),
                Lib.thematicBreakPlugin(),
                Lib.markdownShortcutPlugin(),
                Lib.tablePlugin(),
                Lib.diffSourcePlugin({ diffMarkdown: file._pristine, viewMode: 'rich-text' }),
                Lib.codeBlockPlugin({ defaultCodeBlockLanguage: 'py' }),
                Lib.codeMirrorPlugin({
                    codeBlockLanguages: { py: 'Python', js: 'JavaScript', css: 'CSS', bash: 'bash' }
                }),
                Lib.toolbarPlugin({
                    toolbarClassName: 'my-classname',
                    toolbarContents: () => (
                        <>
                            {' '}
                            <Lib.DiffSourceToggleWrapper>
                                <Lib.InsertTable />
                                <Lib.BoldItalicUnderlineToggles />
                                <Lib.ListsToggle />
                                <Lib.InsertCodeBlock />
                                <Lib.CreateLink />
                                <Lib.CodeToggle />
                                <Lib.BlockTypeSelect />
                                <Lib.InsertAdmonition />
                                <Lib.InsertFrontmatter />
                                <Lib.UndoRedo />
                                <Lib.ConditionalContents
                                    options={[
                                        {
                                            when: (editor) => editor?.editorType === 'codeblock',
                                            contents: () => <Lib.ChangeCodeMirrorLanguage />
                                        },
                                        {
                                            fallback: () => (
                                                <>
                                                    <Lib.InsertCodeBlock />
                                                </>
                                            )
                                        }
                                    ]}
                                />
                            </Lib.DiffSourceToggleWrapper>
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

export default MdxEditor;
