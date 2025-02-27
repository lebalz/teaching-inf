import { ParserResult, RasterParserInput } from '../types';

export const parserP1Raster = ({ width, height, raster }: RasterParserInput): ParserResult => {
    const errors = [];

    try {
        const bits = raster.split(/\s+/);
        const expectedNumberOfBits = width * height;

        if (bits.length === 0) {
            errors.push('Keine Rasterdaten gefunden.');
            return { errors: errors };
        }

        if (bits.length !== expectedNumberOfBits) {
            errors.push(
                `Bildgrösse ist ${width}x${height} (${expectedNumberOfBits} Bits), aber es wurden ${bits.length} Bits gefunden.`
            );
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
                    errors.push(
                        <span>
                            Ungültiger Wert in den Rasterdaten: <code>{bitAscii}</code>.
                        </span>
                    );
                }

                pixels[row * width * 4 + col * 4] = bitValue * 255; // red
                pixels[row * width * 4 + col * 4 + 1] = bitValue * 255; // green
                pixels[row * width * 4 + col * 4 + 2] = bitValue * 255; // blue
                pixels[row * width * 4 + col * 4 + 3] = 255; // alpha
            }
        }

        return {
            imageData: {
                pixels: pixels,
                width,
                height
            },
            errors: errors
        };
    } catch (e) {
        errors.push('Fehler beim Parsen der Bilddaten: ' + e);
        return { errors: errors };
    }
};

export const parseP2Raster = ({ width, height, maxValue, raster }: RasterParserInput): ParserResult => {
    if (!maxValue) {
        return { errors: ['Maximalwert nicht angegeben oder 0'] };
    }

    const errors = [];

    try {
        const bytes = raster.split(/\s+/);
        const expectedNumberOfBytes = width * height;

        if (bytes.length === 0) {
            errors.push('Keine Rasterdaten gefunden.');
            return { errors: errors };
        }

        if (bytes.length !== expectedNumberOfBytes) {
            errors.push(
                `Bildgrösse ist ${width}x${height} (${expectedNumberOfBytes} Bytes), aber es wurden ${bytes.length} Bytes gefunden.`
            );
        }

        if (maxValue <= 1 || maxValue >= 65536) {
            errors.push(
                <span>
                    Maximalwert <code>{maxValue}</code> ungültig. Der Wert muss grösser als 0 und kleiner als
                    65536 sein.
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
                    errors.push(
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
            errors: errors
        };
    } catch (e) {
        errors.push('Fehler beim Parsen der Bilddaten: ' + e);
        return { errors: errors };
    }
};

export const parseP3Raster = ({ width, height, maxValue, raster }: RasterParserInput): ParserResult => {
    if (!maxValue) {
        return { errors: ['Maximalwert nicht angegeben oder 0'] };
    }

    const errors = [];

    try {
        const bytes = raster.split(/\s+/);
        const expectedNumberOfBytes = width * height * 3;

        if (bytes.length === 0) {
            errors.push('Keine Rasterdaten gefunden.');
            return { errors: errors };
        }

        if (bytes.length !== expectedNumberOfBytes) {
            errors.push(
                `Bildgrösse ist ${width}x${height} (${expectedNumberOfBytes} Bytes), aber es wurden ${bytes.length} Bytes gefunden.`
            );
        }

        if (maxValue <= 1 || maxValue >= 65536) {
            errors.push(
                <span>
                    Maximalwert <code>{maxValue}</code> ungültig. Der Wert muss grösser als 0 und kleiner als
                    65536 sein.
                </span>
            );
        }

        const pixels = new Uint8ClampedArray(width * height * 4);
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                for (let val = 0; val < 3; val++) {
                    const byteAscii = bytes[row * width * 3 + col * 3 + val];
                    console.log(byteAscii);

                    if (!byteAscii) {
                        continue;
                    }

                    const byteValue = parseInt(byteAscii);
                    if (isNaN(byteValue)) {
                        errors.push(
                            <span>
                                Ungültiger Wert in den Rasterdaten: <code>{byteAscii}</code>.
                            </span>
                        );
                    }

                    pixels[row * width * 4 + col * 4 + val] = byteValue;
                    if (val === 2) {
                        pixels[row * width * 4 + col * 4 + 3] = 255; // alpha
                    }
                }
            }
        }

        return {
            imageData: {
                pixels: pixels,
                width,
                height
            },
            errors: errors
        };
    } catch (e) {
        errors.push('Fehler beim Parsen der Bilddaten: ' + e);
        return { errors: errors };
    }
};
