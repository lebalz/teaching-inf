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
    it('add comment annotations', async () => {
        const input = `# Heading

            [hello](https://hello.world)

            Some text in a paragraph.

            \`\`\`py
            print('Some Code')
            \`\`\`
            `;
        const result = await process(input);
        expect(result).toMatchInlineSnapshot(`
          "# Heading

          <MdxComment nr={1} nodeNr={1} type="heading" />

          [hello](https://hello.world)

          <MdxComment nr={1} nodeNr={2} type="paragraph" />

          Some text in a paragraph.

          <MdxComment nr={2} nodeNr={3} type="paragraph" />

          \`\`\`py
          print('Some Code')
          \`\`\`

          <MdxComment nr={1} nodeNr={4} type="code" />
          "
        `);
    });
});
