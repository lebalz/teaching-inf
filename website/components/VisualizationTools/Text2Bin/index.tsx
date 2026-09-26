import { mdiArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import * as React from 'react';
import containerStyle from '../container.module.scss';
import { charToUtf8Binary } from '../helpers/binary';

const Text2Bin = () => {
    const [bin, setBin] = React.useState('');
    const [text, setText] = React.useState('');

    React.useEffect(() => {
        const lines = text.split('\n');
        const newBin = lines.map((t) => t.split('').map(charToUtf8Binary).join(' ')).join('\n');
        setBin(newBin);
    }, [text]);
    return (
        <div className={clsx('hero', 'shadow--lw', containerStyle.container)}>
            <div className="container">
                <p className="hero__subtitle">
                    Text <Icon path={mdiArrowRight} size={1} style={{ transform: 'translateY(4px)' }} /> Binär
                </p>
                <div className={clsx()}>
                    <textarea
                        placeholder="Text"
                        className={clsx(containerStyle.input)}
                        rows={Math.max(2, text.split('\n').length)}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        onKeyUp={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                const event = new Event('resize');

                                // Dispatch the resize event on the window object
                                setTimeout(() => window.dispatchEvent(event), 0);
                            }
                        }}
                    ></textarea>
                </div>
                <div className={clsx()}>
                    <CodeBlock language="plaintext" showLineNumbers={false}>
                        {bin}
                    </CodeBlock>
                </div>
            </div>
        </div>
    );
};

export default Text2Bin;
