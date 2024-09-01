import * as React from 'react';
import styles from './styles.module.scss';
import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import { observer } from 'mobx-react-lite';
import { useDocument } from '../../../useContextDocument';
import { DocumentType } from '@site/src/api/document';
import Icon from '@mdi/react';
import { mdiTrayMinus, mdiTrayPlus } from '@mdi/js';
import _ from 'lodash';

interface Props {
    type: 'pre' | 'post';
}

const HiddenCode = observer((props: Props) => {
    const script = useDocument<DocumentType.Script>();
    const [show, setShow] = React.useState(false);
    const code = props.type === 'pre' ? script.meta.preCode : script.meta.postCode;
    if (code.length === 0) {
        return null;
    }
    return (
        <div className={clsx(styles.container)}>
            {show && (
                <div>
                    <CodeBlock
                        language="python"
                        showLineNumbers={false}
                        className={clsx(styles.hiddenCode, styles.pre, show && styles.open)}
                    >
                        {code}
                    </CodeBlock>
                </div>
            )}
            <button
                className={clsx(styles.toggleButton, show && styles.open, styles[props.type])}
                onClick={() => setShow(!show)}
                title={
                    show
                        ? `${_.capitalize(props.type)}-Code Einklappen`
                        : `${_.capitalize(props.type)}-Code Ausklappen`
                }
            >
                <Icon
                    path={show ? mdiTrayMinus : mdiTrayPlus}
                    rotate={(show ? 180 : 0) + (props.type === 'post' ? 180 : 0)}
                    size={1}
                />
            </button>
        </div>
    );
});

export default HiddenCode;
