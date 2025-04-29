import { ObservableMap } from 'mobx';

const KeyRegex = /{{(?<key>[^}]+)}}/;

export const templateReplacer = (code?: string, dynamicValues?: ObservableMap<string, string>) => {
    if (!code) {
        return '';
    }
    let replaced = code;
    let iterations = 0;

    while (true) {
        const match = replaced.match(KeyRegex);
        if (!match || !match.groups || iterations > 50) {
            break;
        }
        iterations++;
        const key = match.groups.key;
        replaced = replaced.replaceAll(`{{${key}}}`, dynamicValues?.get(key) || `<${key}>`);
    }
    return replaced;
};
