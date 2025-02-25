import { ParserResult } from "../util";

export const PATTERN = /P1\s+(?<width>\d+)\s+(?<height>\d+)\s+(?<raster>[\d\D\s]*)/;

export const parseP1 = (match: RegExpExecArray): ParserResult => {
    const syntaxErrors = [];

    try {          
        const { width: parsedWidth, height: parsedHeight, raster } = match.groups as { width: string, height: string, raster: string };
        const width = parseInt(parsedWidth);
        const height = parseInt(parsedHeight);
        
        const bits = raster.split(/\s+/);
        const expectedNumberOfBits = width * height;

        if (bits.length === 0) {
            syntaxErrors.push('Keine Rasterdaten gefunden.');
            return { syntaxErrors };
        }

        if (bits.length !== expectedNumberOfBits) {
            syntaxErrors.push(`Bildgrösse ist ${width}x${height} (${expectedNumberOfBits} Bits), aber es wurden ${bits.length} Bits gefunden.`);
        }

        const pixels = new Uint8ClampedArray(width * height * 4);
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const bitAscii = bits[row * width + col];
                if (!bitAscii) {
                    continue;
                }

                const bitValue = parseInt(bitAscii);
                if (bitValue !== 0 && bitValue !== 1) {
                    syntaxErrors.push(<span>Ungültiger Wert in den Rasterdaten: <code>{bitAscii}</code>.</span>);
                }

                pixels[row * width * 4 + col * 4] = bitValue * 255; // red
                pixels[row * width * 4 + col * 4 + 1] = bitValue * 255; // green
                pixels[row * width * 4 + col * 4 + 2] = bitValue * 255; // blue
                pixels [row * width * 4 + col * 4 + 3] = 255; // alpha
            }
        }
        
        return {
            imageData: {
                pixels: pixels,
                width,
                height,
            },
            syntaxErrors,
        };
    } catch (e) {
        syntaxErrors.push('Fehler beim Parsen der Bilddaten: ' + e);
        return { syntaxErrors }
    }
};
