import { mdiRectangleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { activeEditor$, currentSelection$, MultipleChoiceToggleGroup } from '@mdxeditor/editor';
import { useCellValues } from '@mdxeditor/gurx';
import React from 'react';
import { $isBoxNode, TOGGLE_BOXED_COMMAND } from './BoxNode';

/**
 * A toolbar component that lets the user undo and redo changes in the editor.
 * @group Toolbar Components
 */
export const ToolbarInsertBoxed: React.FC = () => {
    const [selection, editor] = useCellValues(currentSelection$, activeEditor$);
    const [isActive, setIsActive] = React.useState(false);
    React.useLayoutEffect(() => {
        setTimeout(() => {
            editor?.read(() => {
                try {
                    const parents = selection?.getNodes()?.[0]?.getParents() || [];
                    setIsActive(parents.some($isBoxNode));
                } catch (e) {
                    // nop
                }
            });
        }, 1);
    }, [editor, selection]);
    return (
        <MultipleChoiceToggleGroup
            items={[
                {
                    title: 'Box',
                    disabled: false,
                    contents: (
                        <Icon
                            path={mdiRectangleOutline}
                            size={1}
                            color={isActive ? 'var(--ifm-color-blue)' : undefined}
                        />
                    ),
                    active: isActive,
                    onChange: () => {
                        editor?.dispatchCommand(TOGGLE_BOXED_COMMAND, !isActive);
                    }
                }
            ]}
        />
    );
};
