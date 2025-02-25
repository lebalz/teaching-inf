import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import React, { RefObject } from 'react';
import clsx from 'clsx';
import Admonition from '@theme/Admonition';

interface Props {
    default?: string;
    noEditor?: boolean;
    readonly?: boolean;
}

const NetpbmEditor = observer((props: Props) => {

    const SUPPORTED_FORMATS = ['P1', 'P2'];
    const FORMAT_P1 = /P1\s+(?<width>\d+)\s+(?<height>\d+)\s+(?<raster>[\d\D\s]*)/;

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

    const pushSyntaxError = (error: string | React.ReactElement) => {
        syntaxErrors.push(error);
        setDisplaySyntaxErrors(syntaxErrors);
    }

    const pushWarning = (warning: string | React.ReactElement) => {  
        warnings.push(warning);
        setDisplayWarnings(warnings);
    }

    const parseP1 = (match: RegExpExecArray) => {
        try {          
            const { width: parsedWidth, height: parsedHeight, raster } = match.groups as { width: string, height: string, raster: string };
            const width = parseInt(parsedWidth);
            const height = parseInt(parsedHeight);
            
            const bits = raster.split(/\s+/);

            if (bits.length === 0) {
                pushSyntaxError('Keine Rasterdaten gefunden.');
                return;
            }

            if (bits.length !== width * height) {
                pushSyntaxError(`Bildgrösse ist ${width}x${height} (${width*height} Bits), aber es wurden ${bits.length} Bits gefunden.`);
            }

            const rasterData2D = [];
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    const bitAscii = bits[row * width + col];
                    if (!bitAscii) {
                        continue;
                    }

                    const bitValue = parseInt(bitAscii);
                    if (bitValue !== 0 && bitValue !== 1) {
                        pushSyntaxError(<span>Ungültiger Wert in den Rasterdaten: <code>{bitAscii}</code>.</span>);
                    }
                    rasterData2D.push(bitValue); // red
                    rasterData2D.push(bitValue); // green
                    rasterData2D.push(bitValue); // blue
                    rasterData2D.push(255); // alpha
                }
            }
            
            setHeight(parseInt(parsedHeight));
            setWidth(parseInt(parsedWidth));
            setPixels(new Uint8ClampedArray(rasterData2D.map(bit => bit * 255)));
        } catch (e) {
            pushSyntaxError('Fehler beim Parsen der Bilddaten: ' + e);
        }
    };

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

    const render = () => {
        resetImageData();
        resetErrorsAndWarnings();

        const matchP1 = FORMAT_P1.exec(sanitizedData);
        if (matchP1) {
            parseP1(matchP1);
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