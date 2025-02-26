import { ParserResult } from '../util';

export const PATTERN = /P2\s+(?<width>\d+)\s+(?<height>\d+)\s+(?<max>\d+)\s+(?<raster>[\d\D\s]*)/;

export const parseP2 = (match: RegExpExecArray): ParserResult => {
    const syntaxErrors = [];

    try {
        const {
            width: parsedWidth,
            height: parsedHeight,
            max: parsedMax,
            raster
        } = match.groups as { width: string; height: string; max: string; raster: string };
        const width = parseInt(parsedWidth);
        const height = parseInt(parsedHeight);
        const max = parseInt(parsedMax);

        const bytes = raster.split(/\s+/);
        const expectedNumberOfBytes = width * height;

        if (bytes.length === 0) {
            syntaxErrors.push('Keine Rasterdaten gefunden.');
            return { syntaxErrors };
        }

        if (bytes.length !== expectedNumberOfBytes) {
            syntaxErrors.push(
                `Bildgrösse ist ${width}x${height} (${expectedNumberOfBytes} Bytes), aber es wurden ${bytes.length} Bytes gefunden.`
            );
        }

        if (max <= 1 || max >= 65536) {
            syntaxErrors.push(
                <span>
                    Maximalwert <code>{max}</code> ungültig. Der Wert muss grösser als 0 und kleiner als 65536
                    sein.
                </span>
            );
        }

        const pixels = new Uint8ClampedArray(width * height * 4);
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const byteAscii = bytes[row * width + col];
                if (!byteAscii) {
                    continue;
                }

                const byteValue = parseInt(byteAscii);
                if (isNaN(byteValue)) {
                    syntaxErrors.push(
                        <span>
                            Ungültiger Wert in den Rasterdaten: <code>{byteAscii}</code>.
                        </span>
                    );
                }

                pixels[row * width * 4 + col * 4] = byteValue; // red
                pixels[row * width * 4 + col * 4 + 1] = byteValue; // green
                pixels[row * width * 4 + col * 4 + 2] = byteValue; // blue
                pixels[row * width * 4 + col * 4 + 3] = 255; // alpha
            }
        }

        return {
            imageData: {
                pixels: pixels,
                width,
                height
            },
            syntaxErrors
        };
    } catch (e) {
        syntaxErrors.push('Fehler beim Parsen der Bilddaten: ' + e);
        return { syntaxErrors };
    }
};
