import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import React, { RefObject } from 'react';
import clsx from 'clsx';
import Admonition from '@theme/Admonition';
import {parseP1, PATTERN as PATTERN_P1} from './parser/p1Parser';
import { ParserMessage, ParserResult } from './util';

interface Props {
    default?: string;
    noEditor?: boolean;
    readonly?: boolean;
}

const NetpbmEditor = observer((props: Props) => {

    const SUPPORTED_FORMATS = ['P1', 'P2'];

    const [data, setData] = React.useState<string>(props.default || '');
    const [sanitizedData, setSanitizedData] = React.useState<string>('');
    const [displaySyntaxErrors, setDisplaySyntaxErrors] = React.useState<(string|React.ReactElement)[]>([]);
    const [displayWarnings, setDisplayWarnings] = React.useState<(string|React.ReactElement)[]>([]);
    const [height, setHeight] = React.useState<number>(0);
    const [width, setWidth] = React.useState<number>(0);
    const [pixels, setPixels] = React.useState<Uint8ClampedArray>();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    let syntaxErrors: (string|React.ReactElement)[] = [];
    let warnings: (string|React.ReactElement)[] = [];

    React.useEffect(() => {
        const result = data.trim()
            .split('\n')
            .filter((line) => !line.trim().startsWith('#')) // Remove comments.
            .join('\n');

        setSanitizedData(result);
    }, [data]);

    React.useEffect(() => {
        if (!pixels || pixels.length === 0 || width === 0 || height === 0) {
            return;
        }
        console.log(pixels, width, height);
        
        const imageData = new ImageData(pixels, width, height);
        canvasRef.current?.getContext('2d')?.putImageData(imageData, 0, 0);
    }, [pixels]);

    const resetImageData = () => {
        setHeight(0);
        setWidth(0);
        setPixels(new Uint8ClampedArray());
    };

    const pushSyntaxError = (error: ParserMessage | ParserMessage[]) => {
        if (Array.isArray(error)) {
            syntaxErrors.push(...error);
        } else {
            syntaxErrors.push(error);
        }
        setDisplaySyntaxErrors(syntaxErrors);
    }

    const createErrorReport = () => {
        if (!sanitizedData) {
            return;
        }

        const lines = sanitizedData.split('\n');
        if (!SUPPORTED_FORMATS.includes(lines[0].trim())) {
            pushSyntaxError(<span>Unbekanntes Format auf der ersten Zeile: <code>{lines[0].trim()}</code>. Unterstützte Formate: <code>{SUPPORTED_FORMATS.join(', ')}</code>.</span>);
        }


        const dimensionLinePattern = /\s*\d+\s+\d+\s*/;
        const dimensionLineMatch = dimensionLinePattern.exec(lines[1]);
        if (!dimensionLineMatch) {
            pushSyntaxError(<span>Auf der zweiten Zeile werden die Dimensionen des Bildes im Format <code>BREITE HÖHE</code> (z.B. <code>10 6</code>) erwartet.</span>);
        }
    }

    const resetErrorsAndWarnings = () => {
        setDisplaySyntaxErrors([]);
        setDisplayWarnings([]);
        syntaxErrors = [];
        warnings = [];
    };

    const processParserResult =(result: ParserResult) => {
        const { imageData, syntaxErrors } = result;
        pushSyntaxError(syntaxErrors || []);
        if (imageData) {
            setHeight(imageData.height);
            setWidth(imageData.width);
            setPixels(imageData.pixels);
        }
    }

    const render = () => {
        resetImageData();
        resetErrorsAndWarnings();

        const matchP1 = PATTERN_P1.exec(sanitizedData);
        if (matchP1) {
            processParserResult(parseP1(matchP1));
        } else {
            createErrorReport();
        }
    };

    React.useEffect(() => {        
        render();
    }, [sanitizedData]);

    return (
        <div>
            <textarea 
                rows={10}
                className={clsx(styles.editor)}
                onChange={(e) => setData(e.target.value)}
                defaultValue={data} />
            <details>
                <summary>
                    {displaySyntaxErrors?.length > 0 &&  <span>❌</span>}
                    {displaySyntaxErrors?.length == 0 && displayWarnings?.length > 0 && <span>⚠️</span>}
                    {displaySyntaxErrors?.length == 0 && displayWarnings?.length == 0 && <span>✅</span>}
                    <span> Validierung</span>
                </summary>
                {displaySyntaxErrors?.length > 0 && (<Admonition type="danger" title="Syntaxfehler">
                        <ul>
                            {displaySyntaxErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Admonition>)}
                {displayWarnings?.length > 0 && (<Admonition type="warning" title="Warnungen">
                        <ul>
                            {displayWarnings.map((warnung, index) => (
                                <li key={index}>{warnung}</li>
                            ))}
                        </ul>
                    </Admonition>)}
            </details>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
});

export default NetpbmEditor;