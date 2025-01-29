import {
    $createDirectiveNode,
    ButtonOrDropdownButton,
    currentSelection$,
    iconComponentFor$,
    insertDirective$,
    useCellValue,
    useCellValues,
    usePublisher,
    useTranslation
} from '@mdxeditor/editor';
import React from 'react';
import { ADMONITION_TYPES } from '../JsxPluginDescriptors/directive-editors/AdmonitionDescriptor';
import _ from 'lodash';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertAdmonition = () => {
    const [editor] = useLexicalComposerContext();
    const insertDirective = usePublisher(insertDirective$);
    const [iconComponentFor] = useCellValues(iconComponentFor$);
    const t = useTranslation();

    const items = React.useMemo(() => {
        return [...ADMONITION_TYPES, 'details'].map((type) => ({ value: type, label: _.capitalize(type) }));
    }, [t]);

    return (
        <ButtonOrDropdownButton
            title={t('toolbar.admonition', 'Insert Admonition')}
            onChoose={(admonitionName) => {
                editor.update(() => {
                    const selection = $getSelection();

                    if (!$isRangeSelection(selection)) {
                        return;
                    }
                    selection.insertNodes([
                        $createDirectiveNode({
                            name: admonitionName,
                            type: 'containerDirective',
                            children: []
                        })
                    ]);
                });
            }}
            items={items}
        >
            {iconComponentFor('admonition')}
        </ButtonOrDropdownButton>
    );
};
