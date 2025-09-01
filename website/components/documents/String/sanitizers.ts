export const toFixedNum = (num: number, to: number = 3) => {
    const precision = Math.pow(10, to);
    return (Math.round(num * precision) / precision).toString();
};

export const sanitizeNumber = (excludedText: string[] = []) => {
    const replacer = (text: string) => {
        return excludedText.reduce((acc, curr) => acc.replaceAll(curr, ''), text);
    };
    return (solution: string) => {
        return replacer(`${solution}`.replace(',', '.')).replaceAll(/[^\d\.-]/g, '');
    };
};

export const trim = (text?: string) => {
    return text?.trim();
};

export const trimUpper = (text?: string) => {
    return trim(text)?.toUpperCase();
};
