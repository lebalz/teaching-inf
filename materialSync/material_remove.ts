import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import { ConfigEntry, loadMaterialConfig, saveMaterialConfig } from './material_helpers';

const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);

const configs = loadMaterialConfig();
const argv = minimist(process.argv.slice(2));

if (argv.help) {
    console.log(`
yarn run remove [source] [[--from="v1,v2"]]

examples:

yarn run remove docs/byod-basics/v24/ --from="24a,24b"
`);
    process.exit(0);
}

const toRemove = argv._;
const klassen = argv.from ? (argv.from as string).split(',') : Object.keys(configs);

const DOC_PATHS = ['docs/', 'src/pages/', 'news/'];

const docBasePath = (src: string): string => {
    return DOC_PATHS.find((p) => src.startsWith(p)) || DOC_PATHS[0];
};

/**
 * Get path relative to doc base path
 */
const relative2Doc = (p: string): string => {
    const base = docBasePath(p);
    return base ? p.slice(base.length) : p;
};

const ensureTrailingSlash = (p: string): string => {
    if (typeof p !== 'string') {
        return p;
    }
    if (p.endsWith('/')) {
        return p;
    }
    return `${p}/`;
};

klassen.forEach((klass) => {
    const config = configs[klass];
    const keepedFiles: ConfigEntry[] = [];

    config.forEach((src) => {
        const fromRel = relative2Doc(typeof src === 'string' ? src : src.from);
        const from = `${docBasePath(typeof src === 'string' ? src : src.from)}${fromRel}`;
        const to =
            typeof src === 'object' && src.to
                ? src.to
                : `versioned_docs/version-${klass}/${relative2Doc(typeof src === 'string' ? src : src.from)}`;

        let keep = true;

        toRemove.forEach((rmSrc) => {
            let toRmSrc = `${docBasePath(rmSrc)}${relative2Doc(rmSrc)}`;
            console.log(typeof src === 'string' ? src : src.from, fromRel, docBasePath(rmSrc), from, toRmSrc);

            if (fs.lstatSync(toRmSrc).isDirectory()) {
                toRmSrc = ensureTrailingSlash(toRmSrc);
            }

            console.log(from, toRmSrc, from === toRmSrc);

            if (from === toRmSrc) {
                keep = false;
                if (fs.existsSync(to)) {
                    console.log('- remove', to, 'from', klass);
                    let parent = path.dirname(to);
                    if (fs.lstatSync(to).isDirectory()) {
                        console.log('rm dir', to);
                        fs.rmSync(to, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(to);
                    }
                    while (fs.readdirSync(parent).length === 0) {
                        fs.rmSync(parent, { recursive: true, force: true });
                        parent = path.dirname(parent);
                    }
                } else {
                    console.log('- unset', to, 'from', klass);
                }
            }
        });

        if (keep) {
            keepedFiles.push(src);
        }
    });

    configs[klass] = keepedFiles;
});

saveMaterialConfig(configs);
console.log('done');
