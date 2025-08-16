// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { toBlob } from 'html-to-image';
// @ts-ignore
import { Options } from 'html-to-image/lib/options';
import * as React from 'react';

// interface Props {
//     children: JSX.Element;
//     options?: Options;
// }

// type CopyState = 'none' | 'spin' | 'ready' | 'copied' | 'error';

// const CopyIcon: { [key in CopyState]: IconDefinition } = {
//     none: faEllipsisH,
//     copied: faClipboardCheck,
//     error: faTimesCircle,
//     spin: faCircleNotch,
//     ready: faClipboard
// };

import {
    mdiCircle,
    mdiClipboard,
    mdiClipboardCheck,
    mdiClipboardSearch,
    mdiClipboardText,
    mdiCloseCircle,
    mdiDotsHorizontal,
    mdiLoading
} from '@mdi/js';
import Icon, { Stack } from '@mdi/react';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

interface Props {
    children: React.ReactNode;
    options?: Options;
}
type CopyState = 'none' | 'spin' | 'copied' | 'error' | 'ready';

const CopyIcon: { [key in CopyState]: string } = {
    none: mdiDotsHorizontal,
    copied: mdiClipboardCheck,
    error: mdiCloseCircle,
    spin: mdiLoading,
    ready: mdiClipboard
};
// const CopyColor: { [key in CopyState]: string | undefined } = {
//     none: 'var(--ifm-color-primary)',
//     ready: 'var(--ifm-color-primary)',
//     error: 'var(--ifm-color-danger)',
//     copied: 'var(--ifm-color-success)',
//     spin: undefined
// };
const CopyClass: { [key in CopyState]: string } = {
    none: 'button--primary',
    ready: 'button--primary',
    error: 'button--danger',
    copied: 'button--success',
    spin: 'button--secondary'
};

const CopyImageToClipboard = ({ children, options }: Props) => {
    const [blob, setBlob] = React.useState<Blob | undefined>(undefined);
    const [copyState, setCopyState] = React.useState<CopyState>('none');
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (['none', 'spin', 'ready'].includes(copyState)) {
            return;
        }
        const timeoutId = setTimeout(() => setCopyState(copyState === 'copied' ? 'ready' : 'none'), 2000);
        return () => clearTimeout(timeoutId);
    }, [copyState]);

    React.useEffect(() => {
        if (copyState !== 'none') {
            setCopyState('none');
        }
    }, [children]);

    return (
        <React.Fragment>
            <button
                className={clsx('button', 'button--outline', 'button--sm', CopyClass[copyState])}
                disabled={copyState === 'spin'}
                onClick={() => {
                    if (ref.current === null) {
                        return;
                    }
                    if (copyState === 'none') {
                        setCopyState('spin');
                        return toBlob(ref.current, options).then((blob) => {
                            if (blob) {
                                setBlob(blob);
                                setCopyState('ready');
                            }
                        });
                    }
                    if (copyState !== 'ready') {
                        return;
                    }
                    try {
                        navigator.clipboard
                            .write([
                                new ClipboardItem({
                                    ['image/png']: blob as any
                                })
                            ])
                            .then(() => {
                                setCopyState('copied');
                            })
                            .catch((err) => {
                                setCopyState('error');
                                console.warn(err);
                            });
                    } catch (err) {
                        console.warn(err);
                        setCopyState('error');
                    }
                }}
            >
                <Icon path={CopyIcon[copyState]} size={SIZE_S} />
            </button>
            <div ref={ref} className="copy-container">
                {children}
            </div>
        </React.Fragment>
    );
};

export default CopyImageToClipboard;
