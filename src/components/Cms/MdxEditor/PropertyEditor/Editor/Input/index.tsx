import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import CodeEditor from '@tdev-components/shared/CodeEditor';
import Checkbox from '@tdev-components/shared/Checkbox';
import TextInput from '@tdev-components/shared/TextInput';
import Field from '@tdev-models/Form/Field';
import { action } from 'mobx';

interface Props {
    field: Field<string>;
}

const Input = observer((props: Props) => {
    const { field } = props;
    console.log('render', field.name);
    if (field.type === 'expression') {
        return (
            <CodeEditor
                value={field.value}
                placeholder={field.placeholder || 'Wert'}
                onChange={action((val) => field.setValue(val))}
                className={clsx(styles.codeEditor)}
                lang={field.lang}
                hideLineNumbers
            />
        );
    }
    if (field.isCheckbox) {
        return (
            <Checkbox
                checked={typeof field.value === 'boolean' ? field.value : field.value === 'true'}
                onChange={(checked) => field.setValue(`${checked}`)}
            />
        );
    }
    return (
        <TextInput
            onChange={(val) => field.setValue(val)}
            value={field.value}
            noAutoFocus
            noSpellCheck
            placeholder={field.placeholder}
            type={field.type}
        />
    );
});

export default Input;
