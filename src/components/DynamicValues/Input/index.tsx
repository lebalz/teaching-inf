import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import TextInput from '@tdev-components/shared/TextInput';
import Button from '@tdev-components/shared/Button';
import { mdiRestore } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

interface Props {
    name: string;
    defaultValue?: string;
    label?: string;
}

const DynamicInput = observer((props: Props) => {
    const pageStore = useStore('pageStore');
    const { current } = pageStore;
    React.useEffect(() => {
        if (current && !current.dynamicValues.has(props.name)) {
            current.setDynamicValue(props.name, props.defaultValue);
        }
    }, [props.defaultValue, props.name, current]);
    if (!current) {
        return null;
    }
    const value = current.dynamicValues.get(props.name);
    const needsReset = props.defaultValue && value !== props.defaultValue;
    return (
        <div className={clsx(styles.dynamicInput)}>
            <TextInput
                noAutoFocus
                value={value ?? props.defaultValue ?? ''}
                onChange={(val) => {
                    current.setDynamicValue(props.name, val);
                }}
                defaultValue={props.defaultValue}
                label={props.label || props.name}
                labelClassName={clsx(styles.label)}
                className={clsx(styles.input)}
            />
            {needsReset && (
                <Button
                    className={clsx(styles.resetButton)}
                    icon={mdiRestore}
                    onClick={() => {
                        current.setDynamicValue(props.name, props.defaultValue);
                    }}
                    color="secondary"
                    size={SIZE_S}
                    title="Zurücksetzen"
                />
            )}
        </div>
    );
});

export default DynamicInput;
