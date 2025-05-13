import { CONTINUE, SKIP } from 'unist-util-visit';
import path from 'path';
import type { Plugin, Transformer } from 'unified';
import { Root } from 'mdast';
import { promises as fs } from 'fs';
import { Graphviz } from '@hpcc-js/wasm-graphviz';

type ActionStates = 'SPLIT_BRACKETS' | 'CREATE_KBD';

interface OptionsInput {
    imageDir?: string;
}
const plugin: Plugin<OptionsInput[], Root> = function plugin(this, optionsInput = {}): Transformer<Root> {
    let svgEnumerator = 0;
    const dotFileRootDir = optionsInput.imageDir || './images/.dot';
    return async (root, vfile) => {
        const graphviz = await Graphviz.load();
        const mdFileName = path.basename(vfile.history[0]).replaceAll('.', '-');
        const markdownDir = path.dirname(vfile.history[0] || '');
        const dotDir = path.join(markdownDir, dotFileRootDir);
        const imgDir = path.join(dotDir, mdFileName);
        const hasDotDir = await fs
            .stat(imgDir)
            .then(() => true)
            .catch(() => false);
        if (hasDotDir) {
            // cleanup old dot files by removing all files in the directory
            await fs.rm(imgDir, { recursive: true, force: true });
            const dotFiles = await fs.readdir(dotDir);
            if (dotFiles.length === 0) {
                await fs.rm(path.dirname(imgDir), { recursive: true, force: true });
                const mdImgDir = path.dirname(dotDir);
                const imageFiles = await fs.readdir(mdImgDir);
                if (imageFiles.length === 0) {
                    await fs.rm(mdImgDir, { recursive: true, force: true });
                }
            }
        }
        const svgsToCreate: { path: string; value: string }[] = [];
        const { visit } = await import('unist-util-visit');
        visit(root, 'code', (node, idx, parent) => {
            const { lang, value, meta } = node;
            if (lang !== 'dot' || idx === undefined || !parent) {
                return CONTINUE;
            }
            try {
                const svg = graphviz.dot(value, 'svg');
                const svgPath = path.join(
                    dotFileRootDir,
                    mdFileName,
                    `dot-${`${svgEnumerator + 1}`.padStart(3, '0')}.svg`
                );
                svgEnumerator++;
                svgsToCreate.push({ path: svgPath, value: svg });
                parent?.children.splice(idx, 1, {
                    type: 'paragraph',
                    children: [
                        {
                            type: 'image',
                            url: svgPath,
                            alt: meta
                        }
                    ]
                });
                return SKIP;
            } catch (error) {
                // vFile.message(error, position, PLUGIN_NAME);
                return CONTINUE;
            }
        });
        if (svgsToCreate.length > 0) {
            await fs.mkdir(imgDir, { recursive: true });
            await fs.writeFile(
                path.join(imgDir, '.gitignore'),
                `# Ignore all files in current directory\n/*`,
                'utf-8'
            );
            await Promise.all(
                svgsToCreate.map(({ path: svgPath, value: svg }) => {
                    return fs.writeFile(path.join(markdownDir, svgPath), svg, 'utf-8');
                })
            );
        }
    };
};

export default plugin;
