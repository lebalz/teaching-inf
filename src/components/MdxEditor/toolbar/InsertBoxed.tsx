import { mergeRegister } from '@lexical/utils';
import { mdiFormatTextbox } from '@mdi/js';
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
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    IS_BOLD,
    REDO_COMMAND,
    UNDO_COMMAND
} from 'lexical';
import React from 'react';
import { FORMAT_BOX_COMMAND, FORMAT_BOXED } from '../plugins/strong';
import { $createBoxNode } from '../plugins/strong/BoxNode';

/**
 * A toolbar component that lets the user undo and redo changes in the editor.
 * @group Toolbar Components
 */
export const Boxed: React.FC = () => {
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
                            path={mdiFormatTextbox}
                            size={0.8}
                            color={active ? 'var(--ifm-color-blue)' : undefined}
                        />
                    ),
                    active: active,
                    onChange: () => {
                        insertAtSelection(() => $createBoxNode({ type: 'strong', children: [] }));
                    }
                }
            ]}
        />
    );
};
