import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import { ConfigType, ensureSync, loadMaterialConfig, syncSecure } from './material_helpers';

const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);

const typedConfig: ConfigType = loadMaterialConfig();

const DOC_PATHS = ['docs/', 'src/pages/', 'news/'];

const docBasePath = (src: string): string => {
    return DOC_PATHS.find((p) => src.startsWith(p)) || DOC_PATHS[0];
};

/**
 * Recursively find markdown template files (starting with _)
 */
const findMdTemplate = (src: string): string[] => {
    const mdFiles: string[] = [];
    if (fs.lstatSync(src).isDirectory()) {
        fs.readdirSync(src).forEach((file) => {
            const fname = path.join(src, file);
            if (fs.lstatSync(fname).isDirectory()) {
                mdFiles.push(...findMdTemplate(fname));
            } else if ((file.endsWith('.md') || file.endsWith('.mdx')) && file.startsWith('_')) {
                mdFiles.push(fname);
            }
        });
    } else {
        if ((src.endsWith('.md') || src.endsWith('.mdx')) && src.startsWith('_')) {
            mdFiles.push(src);
        }
    }
    return mdFiles;
};

/**
 * Get path relative to doc base path
 */
const relative2Doc = (p: string): string => {
    const base = docBasePath(p);
    return base ? p.slice(base.length) : p;
};

const ensureStartingSlash = (p: string): string => {
    if (typeof p !== 'string') {
        return p;
    }
    if (p.startsWith('/')) {
        return p;
    }
    return `/${p}`;
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

const main = async (): Promise<void> => {
    /**
     * page for the class
     * includes the sync-pages from the secure folder
     */
    if (process.env.WITHOUT_DOCS) {
        console.log('RENAMING docs/ to _docs/');
        fs.renameSync('docs', '_docs');
        fs.mkdirSync('docs');
        fs.cpSync('_docs/home.md', 'docs/home.md');
        /** copy all markdown-templates - otherwise some pages might fail */
        findMdTemplate(path.join(__dirname, '../_docs')).forEach((file) => {
            fs.cpSync(file, file.replace('/_docs/', '/docs/'));
        });
    }
    if (process.env.WITHOUT_DOCS || process.env.NODE_ENV !== 'production') {
        /** copy secure pages */
        await syncSecure();
    }
    /* No Versioning, no News Page */
    if (process.env.DOCS_ONLY) {
        if (fs.existsSync('versioned_docs')) {
            console.log('RENAMING versioned_docs/ to _versioned_docs/');
            fs.renameSync('versioned_docs', '_versioned_docs');
            fs.mkdirSync('versioned_docs');
        }
        if (fs.existsSync('versioned_sidebars')) {
            console.log('RENAMING versioned_sidebars/ to _versioned_sidebars/');
            fs.renameSync('versioned_sidebars', '_versioned_sidebars');
            fs.mkdirSync('versioned_sidebars');
        }
        if (fs.existsSync('versions.json')) {
            console.log('RENAMING versions.json to _versions.json');
            fs.renameSync('versions.json', '_versions.json');
            fs.writeFileSync('versions.json', '[\n  "current"\n]');
        }
        if (fs.existsSync('news')) {
            console.log('RENAMING news/ to _news/');
            fs.renameSync('news', '_news');
            fs.mkdirSync('news');
            fs.writeFileSync(`news/${new Date().toISOString().slice(0, 10)}-news.md`, `# News Placeholder\n`);
        }
    }
    fs.writeFileSync('static/CNAME', (process.env.DOMAIN || 'inf.gbsl.website').replace(/https?:\/\//g, ''), {
        encoding: 'utf-8',
        flag: 'w'
    }); /** overwrite */

    Object.keys(typedConfig).forEach(async (klass) => {
        const config = typedConfig[klass];
        const gitignore: string[] = [];
        const classDir = klass === 'pages' ? 'src/pages/' : `versioned_docs/version-${klass}/`;

        config.forEach(async (src) => {
            let srcPath: string | undefined;
            let toPath: string | undefined;
            const ignore: string[] = [];

            if (typeof src === 'string') {
                srcPath = src;
                toPath = `${classDir}${relative2Doc(src)}`;
            } else {
                srcPath = src.from;
                if (src.to) {
                    toPath = src.to;
                } else {
                    toPath = `${classDir}${relative2Doc(srcPath)}`;
                }
                ignore.push(...(src.ignore || []));
            }

            if (process.env.WITHOUT_DOCS && srcPath.startsWith('docs/')) {
                srcPath = `_${srcPath}`;
            }

            const isDir = fs.lstatSync(srcPath).isDirectory();
            if (isDir) {
                srcPath = ensureTrailingSlash(srcPath);
            }

            const parent = path.dirname(toPath);
            if (!fs.existsSync(parent)) {
                fs.mkdirSync(parent, { recursive: true });
            }

            if (isDir) {
                const sanitizedClassDir = ensureTrailingSlash(toPath.replace(classDir, ''));
                gitignore.push(`${sanitizedClassDir}*`);
                const rsync = new Rsync().source(srcPath).destination(toPath).archive().delete();
                if (ignore.length > 0) {
                    rsync.exclude(ignore.map((i) => ensureStartingSlash(i)));
                    ignore.forEach((ifile) => {
                        const opath = `${srcPath}${ifile}`;
                        const ipath = `${sanitizedClassDir}${ifile}`;
                        if (!fs.existsSync(opath)) {
                            console.warn(
                                `⚠️ [ignore] ${klass}->${srcPath}: ignored "${ifile}" does not exist`
                            );
                            return;
                        }
                        if (fs.lstatSync(opath).isDirectory()) {
                            gitignore.push(`!${ensureTrailingSlash(ipath)}`);
                        } else {
                            gitignore.push(`!${ipath}`);
                        }
                    });
                }
                rsync.exclude(['.sync.*', '*.nosync.*']);
                console.log('SYNC', toPath, srcPath);
                await ensureSync(rsync, srcPath);
            } else {
                fs.copyFileSync(srcPath, toPath);
                gitignore.push(toPath.replace(classDir, ''));
            }

            if (typeof src !== 'string' && src.open) {
                const folder = isDir ? toPath : parent;
                try {
                    fs.mkdirSync(folder, { recursive: true });
                } catch (e) {
                    console.log(e);
                }
                const categoryPath = path.join(folder, '_category_.json');
                console.log('---------- CAT', categoryPath);
                gitignore.push(categoryPath.replace(classDir, ''));
                let category: Record<string, unknown> = {
                    collapsible: true,
                    collapsed: false,
                    className: 'library-item inf-of'
                };
                if (fs.existsSync(categoryPath)) {
                    category = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));
                    category.collapsed = false;
                    category.collapsible = true;
                    category.className = 'library-item inf-of';
                }
                fs.writeFileSync(categoryPath, JSON.stringify(category, undefined, 2) + '\n');
            }

            fs.writeFileSync(`${classDir}.gitignore`, gitignore.join('\n'));
        });
    });
};

main().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
