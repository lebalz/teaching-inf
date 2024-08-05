import React, { useId } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta, StringAnswer } from '@site/src/models/documents/String';
import Button from '../../shared/Button';
import { mdiCheckCircle, mdiCloseCircle, mdiFlashTriangle, mdiHelpCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { ApiState } from '@site/src/stores/iStore';
import SyncStatus from '../../SyncStatus';

interface Props extends MetaInit {
    id: string;
    placeholder?: string;
    label?: string;
    labelWidth?: string;
    width?: string /* input width */;
    children?: JSX.Element;
}

const IconMap: { [key in StringAnswer]: string } = {
    [StringAnswer.Unchecked]: mdiHelpCircleOutline,
    [StringAnswer.Correct]: mdiCheckCircle,
    [StringAnswer.Wrong]: mdiCloseCircle
};

const ColorMap: { [key in StringAnswer]: string } = {
    [StringAnswer.Unchecked]: 'secondary',
    [StringAnswer.Correct]: 'green',
    [StringAnswer.Wrong]: 'red'
};

const String = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    const inputId = useId();
    React.useEffect(() => {
        if (doc) {
            doc.checkAnswer();
        }
    }, [doc]);

    if (!doc) {
        return <Loader />;
    }
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.ctrlKey || event.metaKey) {
            if (event.key === 's') {
                event.preventDefault();
                doc.saveNow();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                doc.checkAnswer();
            }
        }
    };

    return (
        <div
            className={clsx(
                styles.string,
                doc.hasSolution && styles.withSolution,
                props.label && styles.withLabel,
                styles[doc.answer],
                'notranslate'
            )}
        >
            {props.label && (
                <label className={styles.label} style={{ width: props.labelWidth }} htmlFor={inputId}>
                    {props.label}
                </label>
            )}
            {props.children && (
                <label className={styles.label} htmlFor={inputId}>
                    {props.children}
                </label>
            )}
            <div className={clsx(styles.inputBox)}>
                <input
                    type="text"
                    id={inputId}
                    style={{ width: props.width }}
                    spellCheck={false}
                    onChange={(e) => {
                        doc.setData({ text: e.target.value }, true);
                    }}
                    className={clsx(styles.input)}
                    value={doc.text}
                    placeholder={props.placeholder}
                    disabled={props.readonly || !doc.canEdit}
                    onKeyDown={handleKeyDown}
                />
                <div className={clsx(styles.stateIcons)}>
                    <SyncStatus model={doc} size={0.7} />
                    {doc.root?.isDummy && (
                        <Icon
                            path={mdiFlashTriangle}
                            size={0.7}
                            color="orange"
                            title="Wird nicht gespeichert."
                        />
                    )}
                </div>
            </div>
            {doc.hasSolution && (
                <Button
                    onClick={() => doc.checkAnswer()}
                    className={styles.checkButton}
                    icon={IconMap[doc.answer]}
                    color={ColorMap[doc.answer]}
                    size={0.7}
                />
            )}
        </div>
    );
});

export default String;
