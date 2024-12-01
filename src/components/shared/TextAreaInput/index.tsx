import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';

interface Props {
    defaultValue?: string;
    placeholder?: string;
    onChange: (text: string) => void;
    onEnter?: () => void;
    onEscape?: () => void;
    className?: string;
    minRows?: number;
}

const TextAreaInput = observer((props: Props) => {
    const [text, setText] = React.useState(props.defaultValue || '');
    const [rows, setRows] = React.useState(
        Math.max((props.defaultValue || '').split('\n').length, props.minRows || 1)
    );
    React.useEffect(() => {
        const lineCount = text.split('\n').length;
        if (lineCount === rows) {
            return;
        }
        if (lineCount > 1) {
            setRows(lineCount);
        } else {
            setRows(Math.max(1, props.minRows || 1));
        }
    }, [text, rows]);
    return (
        <textarea
            placeholder={props.placeholder}
            value={text}
            className={clsx(props.className, styles.textAreaInput)}
            onChange={(e) => {
                setText(e.target.value);
                props.onChange(e.target.value);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    props.onEnter?.();
                }
                if (e.key === 'Escape') {
                    props.onEscape?.();
                }
                if (e.key === 'Tab') {
                    e.preventDefault(); // Prevent the default tab behavior
                    const inp = e.currentTarget;
                    const selectionStart = inp.selectionStart;
                    const newText = `${text.slice(0, selectionStart)}\t${text.slice(selectionStart)}`;
                    setText(newText);
                    props.onChange(newText);
                    setTimeout(() => {
                        inp?.setSelectionRange(selectionStart + 1, selectionStart + 1);
                    }, 0);
                }
            }}
            rows={rows === 1 ? 1 : rows + 1}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
        />
    );
});

export default TextAreaInput;
