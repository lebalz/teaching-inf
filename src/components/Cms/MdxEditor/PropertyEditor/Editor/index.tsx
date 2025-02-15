import React from 'react';
import _ from 'lodash';
import Card from '@tdev-components/shared/Card';
import { useForm } from 'react-hook-form';
import styles from './styles.module.scss';
import Button from '@tdev-components/shared/Button';
import { mdiClose, mdiCloseCircle, mdiContentSave } from '@mdi/js';
import { Delete } from '@tdev-components/shared/Button/Delete';
import clsx from 'clsx';
import { Property } from '..';

/* @see https://github.com/mdx-editor/editor/blob/main/src/plugins/core/PropertyPopover.tsx */

export interface Props {
    /**
     * The properties to edit. The key is the name of the property, and the value is the initial value.
     */
    properties: Property[];
    /**
     * Triggered when the user edits the property values.
     */
    onChange: (values: Record<string, string>) => void;
    /**
     * The title to display in the popover.
     */
    title?: string;
    onRemove?: () => void;
    onClose?: () => void;
}

const getInputType = (type?: React.HTMLInputTypeAttribute): React.HTMLInputTypeAttribute => {
    if (!type) {
        return 'search';
    }
    if (type === 'string') {
        return 'search';
    }
    return type;
};

const Editor = (props: Props) => {
    const { properties, title } = props;
    const initValues = React.useMemo(() => {
        return properties.reduce<Record<string, string | number>>(
            (acc, { value, name, type, placeholder: defaultValue }) => {
                if (type === 'number') {
                    acc[name] = value || defaultValue || 0;
                } else {
                    acc[name] = value || defaultValue || '';
                }
                return acc;
            },
            {}
        );
    }, [properties]);
    const { register, handleSubmit } = useForm({
        defaultValues: initValues
    });
    console.log('properties', properties);

    return (
        <Card
            header={title && <h4>{title}</h4>}
            classNames={{ card: styles.editor }}
            footer={
                <div className={clsx('button-group', 'button-group--block')}>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            props.onClose?.();
                        }}
                        icon={mdiClose}
                        color="black"
                        iconSide="left"
                    >
                        Abbrechen
                    </Button>
                    {props.onRemove && <Delete onDelete={props.onRemove} />}
                    <Button
                        icon={mdiContentSave}
                        color={'green'}
                        iconSide="right"
                        onClick={handleSubmit((data) => {
                            const res: Record<string, string> = {};
                            Object.entries(data).forEach(([key, val]) => {
                                const prop = properties.find((p) => p.name === key);
                                const defVal = prop?.type === 'number' ? 0 : '';
                                const value = `${val}`;
                                if (defVal === val || defVal === value || `${defVal}` === value) {
                                    return;
                                }
                                res[key] = value;
                            });
                            props.onChange(res);
                            props.onClose?.();
                        })}
                    >
                        Speichern
                    </Button>
                </div>
            }
        >
            {
                <form>
                    <table className={styles.propertyEditorTable}>
                        <thead>
                            <tr>
                                <th className={styles.readOnlyColumnCell}>Attribut</th>
                                <th>Wert</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.properties.map((prop) => (
                                <tr key={prop.name}>
                                    <th className={styles.readOnlyColumnCell}>{prop.name}</th>
                                    <td>
                                        <input
                                            {...register(prop.name)}
                                            className={styles.propertyEditorInput}
                                            type={getInputType(prop.type)}
                                            title={prop.description}
                                            placeholder={`${prop.placeholder}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>
            }
        </Card>
    );
};

export default Editor;
