import * as mdi from '@mdi/js';

export const getIconPath = (name: string): string => {
    const iconName = typeof name === 'string' ? normalizeIconName(name) : '';
    if (!Object.hasOwn(mdi, iconName) || typeof mdi[iconName as keyof typeof mdi] !== 'string') {
        throw new Error(`Unknown MDI icon name: ${name}. Use a name such as mdiAlarmPlus or alarm-plus.`);
    }
    return mdi[iconName as keyof typeof mdi];
};

export const getIconShortName = (name: string): string => {
    const unprefixedName = normalizeIconName(name).slice(3);
    return unprefixedName
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
        .toLowerCase();
};

const normalizeIconName = (name: string): string => {
    const unprefixedName = name.replace(/^mdi(?=-|[A-Z])-?/, '');
    const pascalName = unprefixedName.replace(/(?:^|-)([a-z0-9])/g, (_, letter: string) =>
        letter.toUpperCase()
    );
    return `mdi${pascalName}`;
};
