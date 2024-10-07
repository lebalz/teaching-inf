import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { VFile } from 'vfile';

const alignLeft = (content: string) => {
    return content
        .split('\n')
        .map((line) => line.trimStart())
        .join('\n');
};
const process = async (content: string, pageId: string | null = 'd2f1b301-fbea-4289-8ab0-19c8a6c4ded0') => {
    const { default: plugin } = (await import('../plugin')) as any;
    const file = new VFile(alignLeft(content));
    file.data = { frontMatter: { page_id: pageId } };
    const result = await remark().use(remarkMdx).use(remarkDirective).use(plugin).process(file);

    return result.value;
};

describe('#comment', () => {
    it('does nothing when page_id is missing in the frontMatter', async () => {
        const input = `# Heading

            [hello](https://hello.world)

            \`\`\`py
            print('Some Code')
            \`\`\`
            `;
        const result = await process(input, null);
        expect(result).toMatchInlineSnapshot(`
          "# Heading

          [hello](https://hello.world)

          \`\`\`py
          print('Some Code')
          \`\`\`
          "
        `);
    });
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

          <MdxComment nr={1} nodeNr={1} type="heading" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />

          [hello](https://hello.world)

          <MdxComment nr={1} nodeNr={2} type="paragraph" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />

          Some text in a paragraph.

          <MdxComment nr={2} nodeNr={3} type="paragraph" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />

          \`\`\`py
          print('Some Code')
          \`\`\`

          <MdxComment nr={1} nodeNr={4} type="code" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />
          "
        `);
    });
    it('annotates lists', async () => {
        const input = `
            - hello
            - bello
            - cello
            `;
        const result = await process(input);
        expect(result).toMatchInlineSnapshot(`
          "* hello
            <MdxComment nr={1} nodeNr={1} type="paragraph" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />
          * bello
            <MdxComment nr={2} nodeNr={2} type="paragraph" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />
          * cello
            <MdxComment nr={3} nodeNr={3} type="paragraph" pageId="d2f1b301-fbea-4289-8ab0-19c8a6c4ded0" />
          "
        `);
    });
});
