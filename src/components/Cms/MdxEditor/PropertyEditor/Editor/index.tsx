import React from 'react';
import _ from 'lodash';
import Card from '@tdev-components/shared/Card';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import styles from './styles.module.scss';
import Button from '@tdev-components/shared/Button';
import { mdiClose, mdiCloseCircle, mdiContentSave } from '@mdi/js';
import { Delete } from '@tdev-components/shared/Button/Delete';
import clsx from 'clsx';
import CodeEditor from '@tdev-components/shared/CodeEditor';
import { GenericPropery } from '../../GenericAttributeEditor';
import useIsMobileView from '@tdev-hooks/useIsMobileView';

/* @see https://github.com/mdx-editor/editor/blob/main/src/plugins/core/PropertyPopover.tsx */

export interface Props {
    /**
     * The properties to edit. The key is the name of the property, and the value is the initial value.
     */
    properties: GenericPropery[];
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
    if (type === 'boolean') {
        return 'checkbox';
    }
    return type;
};

const Editor = (props: Props) => {
    const { properties, title } = props;
    const initValues = React.useMemo(() => {
        return properties.reduce<Record<string, string | number>>((acc, { value, name, type }) => {
            acc[name] = value || '';
            return acc;
        }, {});
    }, [properties]);
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: initValues
    });
    const isMobile = useIsMobileView(768);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            const prop = properties.find((p) => p.name === name);
            if (!prop) {
                return;
            }
            if (prop.sideEffect) {
                const sideEffects = prop.sideEffect(value, initValues);
                if (sideEffects) {
                    sideEffects.forEach(({ name, value }) => {
                        setValue(name, value);
                    });
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, initValues, properties, setValue]);

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
                                {!isMobile && <th>Wert</th>}
                                <th className={styles.readOnlyColumnCell}>Beschreibung</th>
                                {isMobile && <th>Wert</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {props.properties.map((prop) => (
                                <tr key={prop.name}>
                                    <th className={styles.readOnlyColumnCell}>{prop.name}</th>
                                    {!isMobile && (
                                        <td className={styles.readOnlyColumnCell}>{prop.description}</td>
                                    )}

                                    <td className={clsx(styles.propertyEditorCell)}>
                                        {prop.type === 'expression' ? (
                                            <CodeEditor
                                                defaultValue={(prop.value || '').trim()}
                                                placeholder={prop.placeholder}
                                                onChange={(value) => {
                                                    setValue(prop.name, value);
                                                }}
                                                lang={prop.lang}
                                                hideLineNumbers
                                            />
                                        ) : (
                                            <input
                                                {...register(prop.name)}
                                                className={styles.propertyEditorInput}
                                                type={getInputType(prop.type)}
                                                title={prop.description}
                                                placeholder={
                                                    prop.placeholder ? `${prop.placeholder}` : undefined
                                                }
                                            />
                                        )}
                                    </td>
                                    {isMobile && (
                                        <td className={styles.readOnlyColumnCell}>{prop.description}</td>
                                    )}
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
