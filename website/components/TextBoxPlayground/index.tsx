import styles from './styles.module.scss';
import { useEffect, useId, useState } from 'react';
import { useStore } from '@tdev/hooks/useStore';
import { action } from 'mobx';

interface Props {
    id: string;
    defaultValue?: string;
    height?: string;
    fontSize?: string;
    noSpellCheck?: boolean;
}

const TextBoxPlayground = ({ id, defaultValue, height, noSpellCheck }: Props) => {
    const store = useStore('siteStore').toolsStore;

    const [text, setText] = useState<string>(defaultValue ?? '');

    useEffect(() => {
        setText((store.textFieldPlaygrounds.get(id) || defaultValue) ?? '');
    }, []);

    return (
        <textarea
            className={styles.textarea}
            style={{ height: height ?? '10rem', fontSize: '0.75rem' }}
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                store.setTextFieldValue(id, e.target.value);
            }}
            spellCheck={!noSpellCheck}
        />
    );
};

export default TextBoxPlayground;
