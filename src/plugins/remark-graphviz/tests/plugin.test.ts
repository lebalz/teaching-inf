import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'url';
import { VFile } from 'vfile';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const alignLeft = (content: string) => {
    return content
        .split('\n')
        .map((line) => line.trimStart())
        .join('\n');
};
const process = async (content: string, fileName?: string) => {
    const { default: plugin } = (await import('../plugin')) as any;
    const file = new VFile({
        value: alignLeft(content),
        history: [fileName ? path.join(__dirname, fileName) : __filename]
    });

    const result = await remark().use(remarkMdx).use(remarkDirective).use(plugin).process(file);

    return result.value;
};

describe('#graphviz', () => {
    it("does nothing if there's no defbox", async () => {
        const input = `# Heading

            Some content
        `;
        const result = await process(input);
        expect(result).toBe(alignLeft(input));
    });
    it('can convert dot codeblocks', async () => {
        const input = alignLeft(`# Dot
          \`\`\`dot
          digraph G {
              a -> b;
          }
          \`\`\`
        `);
        const result = await process(input);
        expect(result).toMatchInlineSnapshot(`
          "# Dot

          ![](images/.dot/plugin-test-ts/dot-001.svg)
          "
        `);
    });
    it('respects filename domain', async () => {
        const input = alignLeft(`# Dot
          \`\`\`dot
          digraph G {
              a -> b;
          }
          \`\`\`
        `);
        const result = await process(input, 'foobar.md');
        expect(result).toMatchInlineSnapshot(`
          "# Dot

          ![](images/.dot/foobar-md/dot-001.svg)
          "
        `);
    });
    it('uses meta as alt', async () => {
        const input = alignLeft(`# Dot
          \`\`\`dot A Digraph --width=200
          digraph G {
              a -> b;
          }
          \`\`\`
        `);
        const result = await process(input);
        expect(result).toMatchInlineSnapshot(`
          "# Dot

          ![A Digraph --width=200](images/.dot/plugin-test-ts/dot-001.svg)
          "
        `);
    });
});
