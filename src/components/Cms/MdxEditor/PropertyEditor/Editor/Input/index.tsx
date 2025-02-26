import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { FormField } from '@tdev-models/Form';
import CodeEditor from '@tdev-components/shared/CodeEditor';
import Checkbox from '@tdev-components/shared/Checkbox';
import TextInput from '@tdev-components/shared/TextInput';

interface Props {
    config: FormField<string>;
    onChange: (value: string) => void;
    value: string;
}

const Input = observer((props: Props) => {
    const { config, onChange, value } = props;
    if (config.type === 'expression') {
        return (
            <CodeEditor
                value={value}
                placeholder={config.placeholder || 'Wert'}
                onChange={onChange}
                className={clsx(styles.codeEditor)}
                lang={config.lang}
                hideLineNumbers
            />
        );
    }
    if (config.type === 'checkbox') {
        return (
            <Checkbox
                checked={typeof value === 'boolean' ? value : value === 'true'}
                onChange={(checked) => onChange(`${checked}`)}
            />
        );
    }
    if (config.type === 'string') {
        return (
            <TextInput
                onChange={onChange}
                value={value}
                noAutoFocus
                noSpellCheck
                placeholder={config.placeholder}
            />
        );
    }
    return (
        <input
            onChange={(e) => {
                onChange(e.target.value);
            }}
            value={value}
            className={styles.generic}
            type={config.type}
            title={config.description}
            placeholder={config.placeholder}
        />
    );
});

export default Input;
