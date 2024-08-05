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
import SyncStatus from '../../SyncStatus';

interface Props extends MetaInit {
    id: string;
    placeholder?: string;
    label?: string;
    labelWidth?: string;
    inputWidth?: string /* input width */;
    children?: JSX.Element;
    type?: React.HTMLInputTypeAttribute | undefined;
    stateIconsPosition?: 'inside' | 'outside' | 'hidden';
    hideWarning?: boolean;
    hideApiState?: boolean;
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
    const inputType = props.type || 'text';
    const stateIconsPosition =
        props.stateIconsPosition ||
        (['text', 'url', 'email', 'tel'].includes(inputType) ? 'inside' : 'outside');
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
    const style: React.CSSProperties | undefined =
        props.type === 'color' && doc.text ? { ['--ifm-color-secondary' as any]: doc.text } : undefined;

    const StateIcons = () => (
        <div className={clsx(styles.stateIcons, styles[stateIconsPosition])}>
            {!props.hideApiState && <SyncStatus model={doc} size={0.7} />}
            {doc.root?.isDummy && !props.hideWarning && (
                <Icon path={mdiFlashTriangle} size={0.7} color="orange" title="Wird nicht gespeichert." />
            )}
        </div>
    );

    return (
        <div
            className={clsx(
                styles.string,
                doc.hasSolution && styles.withSolution,
                (props.label || props.children) && styles.withLabel,
                styles[doc.answer],
                'notranslate'
            )}
            style={style}
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
                    type={props.type || 'text'}
                    id={inputId}
                    style={{ width: props.inputWidth }}
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
                {stateIconsPosition === 'inside' && <StateIcons />}
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
            {stateIconsPosition === 'outside' && <StateIcons />}
        </div>
    );
});

export default String;
