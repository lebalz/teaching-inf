import { mergeRegister } from '@lexical/utils';
import { mdiFormatTextbox, mdiShapeRectanglePlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
    activeEditor$,
    applyFormat$,
    currentFormat$,
    currentSelection$,
    insertDecoratorNode$,
    MultipleChoiceToggleGroup
} from '@mdxeditor/editor';
import { useCellValues, usePublisher, withLatestFrom } from '@mdxeditor/gurx';
import {
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    IS_BOLD,
    REDO_COMMAND,
    UNDO_COMMAND
} from 'lexical';
import React from 'react';
import { FORMAT_BOX_COMMAND, FORMAT_BOXED } from '.';
import { $createBoxNode } from './BoxNode';

/**
 * A toolbar component that lets the user undo and redo changes in the editor.
 * @group Toolbar Components
 */
export const ToolbarInsertBoxed: React.FC = () => {
    const [selection] = useCellValues(currentSelection$);
    const insertAtSelection = usePublisher(insertDecoratorNode$);
    const active = false;
    return (
        <MultipleChoiceToggleGroup
            items={[
                {
                    title: 'Box',
                    disabled: false,
                    contents: (
                        <Icon
                            path={mdiShapeRectanglePlus}
                            size={0.8}
                            color={active ? 'var(--ifm-color-blue)' : undefined}
                        />
                    ),
                    active: active,
                    onChange: () => {
                        insertAtSelection(() => {
                            const box = $createBoxNode({
                                type: 'strong',
                                children: [
                                    {
                                        type: 'text',
                                        value:
                                            $isRangeSelection(selection) && !selection.isCollapsed()
                                                ? selection.getTextContent().trim() || ''
                                                : ''
                                    }
                                ]
                            });
                            // box.getWritable().insertAfter();
                            return box;
                        });
                    }
                }
            ]}
        />
    );
};
