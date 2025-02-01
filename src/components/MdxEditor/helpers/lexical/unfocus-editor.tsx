import { activeEditor$, currentSelection$, useCellValues } from '@mdxeditor/editor';
import { $getSelection, $setSelection, type LexicalEditor } from 'lexical';

const unfocusEditor = () => {
    const [selection, editor] = useCellValues(currentSelection$, activeEditor$);
    // Clear the selection inside the current Lexical editor
    editor?.update(() => {
        console.log('Selection:', selection);
        if (selection !== null) {
            $setSelection(null); // Remove selection to unfocus
        }
    });

    // // Optionally focus on a different element
    // const fallbackElement = document.getElementById('fallback-element'); // Replace with your element
    // if (fallbackElement) {
    //     fallbackElement.focus();
    // }
};

export default unfocusEditor;
