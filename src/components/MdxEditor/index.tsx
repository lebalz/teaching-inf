import React from 'react';
import { observer } from 'mobx-react-lite';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import type {
    ExcalidrawImperativeAPI,
    LibraryItems,
    NormalizedZoomValue
} from '@excalidraw/excalidraw/types/types';
import { Source } from '@tdev-models/iDocument';
import { reaction } from 'mobx';
import { useColorMode } from '@docusaurus/theme-common';
import type * as MdxEditorLib from '@mdxeditor/editor';
import _ from 'lodash';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import { useDocument } from '@tdev-hooks/useDocument';
import { DocumentType } from '@tdev-api/document';
import { useClientLib } from '@tdev-hooks/useClientLib';
import '@mdxeditor/editor/style.css';

export interface Props {}

const MdxEditor = observer((props: Props) => {
    const Lib = useClientLib<typeof MdxEditorLib>(() => import('@mdxeditor/editor'), '@mdxeditor/editor');

    if (!Lib) {
        return null;
    }
    return (
        <Lib.MDXEditor
            markdown="# Hello world"
            plugins={[
                Lib.headingsPlugin(),
                Lib.listsPlugin(),
                Lib.quotePlugin(),
                Lib.thematicBreakPlugin(),
                Lib.markdownShortcutPlugin(),
                Lib.directivesPlugin(),
                Lib.codeBlockPlugin({ defaultCodeBlockLanguage: 'py' }),
                Lib.codeMirrorPlugin({ codeBlockLanguages: { py: 'Python', js: 'JavaScript', css: 'CSS' } }),
                Lib.toolbarPlugin({
                    toolbarClassName: 'my-classname',
                    toolbarContents: () => (
                        <>
                            {' '}
                            <Lib.UndoRedo />
                            <Lib.BoldItalicUnderlineToggles />
                            <Lib.ListsToggle />
                            <Lib.InsertCodeBlock />
                            <Lib.CreateLink />
                            <Lib.CodeToggle />
                            <Lib.BlockTypeSelect />
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
                        </>
                    )
                })
            ]}
        />
    );
});

export default MdxEditor;
