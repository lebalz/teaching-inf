import clsx from 'clsx';
import containerStyle from '../container.module.scss';
import * as React from 'react';
import { fromUTF8 } from '../helpers/binary';
import CodeBlock from '@theme/CodeBlock';
import Icon from '@mdi/react';
import { mdiArrowRight } from '@mdi/js';

interface Props {}
const Bin2Text = () => {
    const [bin, setBin] = React.useState('');
    const [text, setText] = React.useState('');

    React.useEffect(() => {
        const lines = bin.split('\n');
        const txt = lines.map((t) => fromUTF8(t)).join('\n');
        setText(txt);
    }, [bin]);
    return (
        <div className={clsx('hero', 'shadow--lw', containerStyle.container)}>
            <div className="container">
                <p className="hero__subtitle">
                    Binär <Icon path={mdiArrowRight} size={1} style={{ transform: 'translateY(4px)' }} /> Text
                </p>
                <div className={clsx()}>
                    <textarea
                        placeholder="Binäre Zeichenkette"
                        className={clsx(containerStyle.input)}
                        rows={Math.max(2, bin.split('\n').length)}
                        value={bin}
                        onChange={(e) => {
                            const pos = Math.max(e.target.selectionStart, e.target.selectionEnd);
                            const sanitized = e.target.value.replace(/[^01\s\n]/g, '');
                            const shift = sanitized === bin ? -1 : 0;
                            setBin(sanitized);
                            setTimeout(() => e.target.setSelectionRange(pos + shift, pos + shift), 0);
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
                        {text}
                    </CodeBlock>
                </div>
            </div>
        </div>
    );
};

export default Bin2Text;
