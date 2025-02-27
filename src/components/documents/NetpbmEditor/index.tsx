import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import React from 'react';
import clsx from 'clsx';
import { parseP1, PATTERN as PATTERN_P1 } from './parser/p1Parser';
import { ParserMessage, ParserResult } from './types';
import ImageCanvas from './ImageCanvas';
import { parseP2, PATTERN as PATTERN_P2 } from './parser/p2Parser';
import { parseP3, PATTERN as PATTERN_P3 } from './parser/p3Parser';
import { MetaInit, ModelMeta } from '@tdev-models/documents/NetpbmGrapic';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import { Source } from '@tdev-models/iDocument';
import SyncStatus from '@tdev-components/SyncStatus';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiCheckAll, mdiFlashTriangle } from '@mdi/js';

interface Props extends MetaInit {
    id: string;
    noEditor?: boolean;
}

const NetpbmEditor = observer((props: Props) => {
    const SUPPORTED_FORMATS = ['P1', 'P2', 'P3'];

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

    const createErrorReport = () => {
        if (!sanitizedData) {
            return;
        }

        const lines = sanitizedData.split('\n');
        if (!SUPPORTED_FORMATS.includes(lines[0].trim())) {
            appendError(
                <span>
                    Unbekanntes Format auf der ersten Zeile: <code>{lines[0].trim()}</code>. Unterstützte
                    Formate: <code>{SUPPORTED_FORMATS.join(', ')}</code>.
                </span>
            );
        }

        const dimensionLinePattern = /\s*\d+\s+\d+\s*/;
        const dimensionLineMatch = dimensionLinePattern.exec(lines[1]);
        if (!dimensionLineMatch) {
            appendError(
                <span>
                    Auf der zweiten Zeile werden die Dimensionen des Bildes im Format <code>BREITE HÖHE</code>{' '}
                    (z.B. <code>10 6</code>) erwartet.
                </span>
            );
        }

        // TODO: Max value for P2/P3.
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

        const matchP1 = PATTERN_P1.exec(sanitizedData);
        const matchP2 = PATTERN_P2.exec(sanitizedData);
        const matchP3 = PATTERN_P3.exec(sanitizedData);

        if (matchP1) {
            processParserResult(parseP1(matchP1));
        } else if (matchP2) {
            processParserResult(parseP2(matchP2));
        } else if (matchP3) {
            processParserResult(parseP3(matchP3));
        } else {
            createErrorReport();
        }
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
                    {!hasErrorsOrWarnings() && <div className={styles.summaryLabel}><Icon path={mdiCheckAll} size={1} /> Ok</div>}
                    {hasErrorsOrWarnings() && (
                        <details>
                            <summary>
                                {hasErrors() && !hasWarnings() && <div className={styles.summaryLabel}><Icon path={mdiAlertCircle} size={0.8} color="red" /> Fehler</div>}
                                {hasErrors() && hasWarnings() && <div className={styles.summaryLabel}><Icon path={mdiAlertCircle} size={1} color="red" /> Fehler & Warnungen</div>}
                                {!hasErrors() && hasWarnings() && <div className={styles.summaryLabel}><Icon path={mdiAlertCircle} size={1} color="red" /> Warnungen</div>}
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
