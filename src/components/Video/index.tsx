import React from 'react';
import styles from './styles.module.scss';

import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiWindowMinimize } from '@mdi/js';
import Loader from '../Loader';
interface Props {
    src: string;
    type?: 'mp4';
    title?: string | JSX.Element;
    expanded?: boolean;
    children?: string | JSX.Element;
}

const Video = (props: Props) => {
    const [open, setOpen] = React.useState(!!props.expanded);
    const [visible, setVisible] = React.useState(false);
    const videoRef = React.useRef<HTMLDivElement>(null);

    const checkVisibility = React.useMemo(() => {
        return () => {
            if (!videoRef.current) {
                return;
            }
            const bbox = videoRef.current.getBoundingClientRect();
            const { top, bottom } = bbox;
            const { innerHeight } = window;
            if (top < innerHeight && bottom > 0) {
                if (!visible) {
                    setVisible(true);
                }
            } else {
                if (visible) {
                    setVisible(false);
                }
            }
        };
    }, [videoRef.current]);

    //attach our function to document event listener on scrolling whole doc
    React.useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        document.addEventListener('scroll', checkVisibility);
        checkVisibility();
        return () => {
            document.removeEventListener('scroll', checkVisibility);
        };
    }, [videoRef.current]);

    const onClick = () => {
        setOpen(true);
        checkVisibility();
    };
    return (
        <div ref={videoRef} className={styles.videoComponent}>
            {open ? (
                <div className={styles.cardOpen}>
                    <div className={styles.headerOpen}>
                        {props.title && <h5 className={styles.title}>{props.title}</h5>}
                        {!props.expanded && (
                            <button
                                className={clsx(
                                    'button button--sm button--outline button--secondary',
                                    styles.minimize
                                )}
                                onClick={onClick}
                            >
                                <Icon path={mdiWindowMinimize} size={1} />
                            </button>
                        )}
                        {props.children && <div className={styles.description}>{props.children}</div>}
                    </div>
                    {visible ? (
                        <video controls autoPlay width="100%" loop>
                            <source src={props.src} type={`video/${props.type || 'mp4'}`} />
                        </video>
                    ) : (
                        <div style={{ height: '150px' }}>
                            <Loader />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className={clsx(
                        'button button--block button--outline button--secondary',
                        styles.wrapButton
                    )}
                    onClick={onClick}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
                    }}
                >
                    <div className={styles.headerClosed}>
                        <div className={styles.title}>{props.title || 'Video'}</div>
                        {props.children && <div className={styles.description}>{props.children}</div>}
                    </div>
                    {visible ? (
                        <video style={{ marginLeft: 'auto' }} autoPlay controls height="150px" loop>
                            <source src={props.src} type={`video/${props.type || 'mp4'}`} />
                        </video>
                    ) : (
                        <div style={{ height: '150px' }}>
                            <Loader />
                        </div>
                    )}
                </button>
            )}
        </div>
    );
};
export default Video;
