import BrowserWindow from '@site/src/components/BrowserWindow';

# Code Defbox

Praktisch um Code Befehle zu definieren.

````md
:::def[`forward(n)` `fd(n)`]{h=3}
Bewegt die Turtle `n` Pixel nach vorne.

```py live_py slim
from turtle import forward
### PRE
forward(100)
```
:::
````

<BrowserWindow>
:::def[`forward(n)` `fd(n)`]{h=3}
Bewegt die Turtle `n` Pixel nach vorne.

```py live_py slim
from turtle import forward
### PRE
forward(100)
```
:::
</BrowserWindow>

## Installation

:::info[Code]
- `src/components/CodeDefBox`
- `src/plugins/remark-code-defbox`
:::

:::info[`src/theme/MDXComponents.tsx`]
```tsx {2-4,9-11}
import MDXComponents from '@theme-original/MDXComponents';
import DefBox from '../components/DefBox';
import DefHeading from '../components/DefBox/DefHeading';
import DefContent from '../components/DefBox/DefContent';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  DefBox: DefBox,
  DefHeading: DefHeading,
  DefContent: DefContent
};
```
:::

:::info[`docusaurus.config.ts]

```ts {1,8,11,14}
import defboxPlugin from './src/plugins/remark-code-defbox/plugin';
const config: Config = {
    presets: [
        [
            'classic',
            {
                docs: {
                    beforeDefaultRemarkPlugins: [defboxPlugin]
                },
                blog: {
                    beforeDefaultRemarkPlugins: [defboxPlugin]
                },
                pages: {
                    beforeDefaultRemarkPlugins: [defboxPlugin]
                },
            }
        ]
    ]
}

```
:::