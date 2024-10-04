import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';

const alignLeft = (content: string) => {
    return content
        .split('\n')
        .map((line) => line.trimStart())
        .join('\n');
};
const process = async (content: string) => {
    const { default: plugin } = (await import('../plugin')) as any;
    const result = await remark().use(remarkMdx).use(remarkDirective).use(plugin).process(alignLeft(content));

    return result.value;
};

describe('#comment', () => {
    it('adds a MdxPage', async () => {
        const input = `# Heading

            [hello](https://hello.world)
            `;
        const result = await process(input);
        expect(result).toMatchInlineSnapshot(`
          "<MdxPage />

          # Heading

          [hello](https://hello.world)
          "
        `);
    });
});
