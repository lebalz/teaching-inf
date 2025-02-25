export type ParserMessage = string | React.ReactElement;

export interface ParserImageDataResult {
    pixels: Uint8ClampedArray;
    width: number;
    height: number; 
}

export interface ParserResult {
    imageData?: ParserImageDataResult;
    syntaxErrors?: ParserMessage[];
    warnings?: ParserMessage[];
}

