import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import React from 'react';
import clsx from 'clsx';
import { ParserMessage, ParserResult } from './types';
import ImageCanvas from './ImageCanvas';
import { MetaInit, ModelMeta } from '@tdev-models/documents/NetpbmGrapic';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import { Source } from '@tdev-models/iDocument';
import SyncStatus from '@tdev-components/SyncStatus';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiCheckAll, mdiFlashTriangle } from '@mdi/js';
import { parse, SUPPORTED_FORMATS } from './parser/parser';

interface Props extends MetaInit {
    id: string;
    noEditor?: boolean;
}

const NetpbmEditor = observer((props: Props) => {
    const [sanitizedData, setSanitizedData] = React.useState<string>('');
    const [displayedErrors, setDisplayedErrors] = React.useState<(string | React.ReactElement)[]>([]);
    const [displayedWarnings, setDisplayedWarnings] = React.useState<(string | React.ReactElement)[]>([]);
    const [height, setHeight] = React.useState<number>(0);
    const [width, setWidth] = React.useState<number>(0);
    const [pixels, setPixels] = React.useState<Uint8ClampedArray>();

    let errors: (string | React.ReactElement)[] = [];
    let warnings: (string | React.ReactElement)[] = [];

    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);

    React.useEffect(() => {
        const result = doc.data.imageData
            .trim()
            .split('\n')
            .filter((line) => !line.trim().startsWith('#')) // Remove comments.
            .join('\n');

        setSanitizedData(result);
    }, [doc.data.imageData]);

    const resetImageData = () => {
        setHeight(0);
        setWidth(0);
        setPixels(new Uint8ClampedArray());
    };

    const appendError = (error: ParserMessage | ParserMessage[]) => {
        if (Array.isArray(error)) {
            errors.push(...error);
        } else {
            errors.push(error);
        }
        setDisplayedErrors(errors);
    };

    const resetErrorsAndWarnings = () => {
        setDisplayedErrors([]);
        setDisplayedWarnings([]);
        errors = [];
        warnings = [];
    };

    const processParserResult = (result: ParserResult) => {
        const { imageData, errors } = result;
        appendError(errors || []);
        if (imageData) {
            setHeight(imageData.height);
            setWidth(imageData.width);
            setPixels(imageData.pixels);
        }
    };

    const render = () => {
        resetImageData();
        resetErrorsAndWarnings();
        processParserResult(parse(sanitizedData));
    };

    React.useEffect(() => {
        render();
    }, [sanitizedData]);

    const StateIcons = () => (
        <span className={clsx(styles.stateIcons)}>
            <SyncStatus model={doc} size={0.7} />
            {doc.root?.isDummy && (
                <Icon path={mdiFlashTriangle} size={0.7} color="orange" title="Wird nicht gespeichert." />
            )}
        </span>
    );

    const hasErrorsOrWarnings = () => displayedErrors.length > 0 || displayedWarnings.length > 0;
    const hasWarnings = () => displayedWarnings.length > 0;
    const hasErrors = () => displayedErrors.length > 0;

    return (
        <div>
            <div className={clsx(styles.editor, { [styles.hidden]: props.noEditor })}>
                <div className={styles.textAreaWrapper}>
                    <StateIcons />
                    <textarea
                        rows={12}
                        className={clsx(styles.editorTextArea)}
                        onChange={(e) => doc.setData({ imageData: e.target.value }, Source.LOCAL)}
                        value={doc.data.imageData}
                        disabled={props.readonly}
                    />
                </div>
                <div
                    className={clsx(styles.validationWrapper, 'alert', {
                        ['alert--secondary']: !hasErrorsOrWarnings(),
                        ['alert--warning']: hasWarnings() && !hasErrors(),
                        ['alert--danger']: hasErrors()
                    })}
                >
                    {!hasErrorsOrWarnings() && (
                        <div className={styles.summaryLabel}>
                            <Icon path={mdiCheckAll} size={1} /> Ok
                        </div>
                    )}
                    {hasErrorsOrWarnings() && (
                        <details>
                            <summary>
                                {hasErrors() && !hasWarnings() && (
                                    <div className={styles.summaryLabel}>
                                        <Icon path={mdiAlertCircle} size={0.8} color="red" /> Fehler
                                    </div>
                                )}
                                {hasErrors() && hasWarnings() && (
                                    <div className={styles.summaryLabel}>
                                        <Icon path={mdiAlertCircle} size={1} color="red" /> Fehler & Warnungen
                                    </div>
                                )}
                                {!hasErrors() && hasWarnings() && (
                                    <div className={styles.summaryLabel}>
                                        <Icon path={mdiAlertCircle} size={1} color="red" /> Warnungen
                                    </div>
                                )}
                            </summary>
                            <ul>
                                {displayedWarnings.map((warnung, index) => (
                                    <li key={index}>⚠️ {warnung}</li>
                                ))}
                                {displayedErrors.map((error, index) => (
                                    <li key={index}>❌ {error}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            </div>
            <ImageCanvas width={width} height={height} pixels={pixels} />
        </div>
    );
});

export default NetpbmEditor;
