import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import {
    mdiAccountQuestionOutline,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarkedOutline,
    mdiStar,
    mdiStarHalfFull,
    mdiStarOutline
} from '@mdi/js';
import { StateType } from '@site/src/api/document';
import { useFirstMainDocument } from '@site/src/hooks/useFirstMainDocument';
import Icon from '@mdi/react';
import { default as TaskStateModel, MetaInit, TaskMeta } from '@site/src/models/documents/TaskState';
import Loader from '../../Loader';
import { useStore } from '@site/src/hooks/useStore';

export const mdiIcon: { [key in StateType]: string } = {
    checked: mdiCheckboxMarkedOutline,
    unset: mdiCheckboxBlankOutline,
    question: mdiAccountQuestionOutline,
    star: mdiStar,
    ['star-half']: mdiStarHalfFull,
    ['star-empty']: mdiStarOutline
};

export const mdiBgColor: { [key in StateType]: string } = {
    checked: '--ifm-color-success',
    unset: '--ifm-color-secondary',
    question: '--ifm-color-warning',
    star: '--ifm-color-primary',
    ['star-empty']: '--ifm-color-primary',
    ['star-half']: '--ifm-color-primary'
};
export const mdiColor: { [key in StateType]: string } = {
    checked: 'white',
    unset: 'black',
    question: 'white',
    star: 'gold',
    'star-empty': 'gold',
    'star-half': 'gold'
};

interface Props extends MetaInit {
    id: string;
    children?: JSX.Element;
    label?: string;
    pagePosition?: number;
    inline?: boolean;
}

const TaskState = observer((props: Props) => {
    const [meta] = React.useState(new TaskMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!doc) {
        return <Loader noLabel title="Laden" align="left" className={clsx(styles.state, styles.loader)} />;
    }
    return (
        <TaskStateComponent {...props} taskState={doc}>
            {props.children}
        </TaskStateComponent>
    );
});

interface ComponentProps extends Props {
    taskState: TaskStateModel;
}

export const TaskStateComponent = observer((props: ComponentProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const pageStore = useStore('pageStore');
    const [animate, setAnimate] = React.useState(false);
    const doc = props.taskState;

    React.useEffect(() => {
        if (doc.root && pageStore.current && !doc.root.isDummy) {
            pageStore.current.addDocumentRoot(doc);
        }
    }, [doc, pageStore.current]);

    React.useEffect(() => {
        if (ref.current && doc.scrollTo) {
            ref.current.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'start' });
            doc.setScrollTo(false);
            setAnimate(true);
        }
    }, [ref, doc.scrollTo]);

    React.useEffect(() => {
        if (animate) {
            const timeout = setTimeout(() => {
                setAnimate(false);
            }, 2000);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [animate]);

    return (
        <div
            ref={ref}
            className={clsx(
                styles.state,
                'state-component',
                props.children && styles.noHeader,
                'no-comments',
                doc.root?.isDummy && styles.dummy,
                props.inline && styles.inline
            )}
        >
            <div
                className={clsx(
                    styles.state,
                    styles.checkbox,
                    props.readonly && styles.readonly,
                    animate && styles.animate
                )}
                style={{ backgroundColor: `var(${mdiBgColor[doc.taskState]})` }}
                onClick={() => {
                    if (props.readonly) {
                        return;
                    }
                    doc.nextState();
                }}
                title={props.readonly ? 'Nur Anzeigen' : undefined}
            >
                <Icon path={mdiIcon[doc.taskState]} size={1} color={mdiColor[doc.taskState]} />
            </div>
            {(props.children || props.label) && (
                <div
                    onClick={() => {
                        if (props.readonly) {
                            return;
                        }
                        doc.nextState();
                    }}
                >
                    {props.children || props.label}
                </div>
            )}
        </div>
    );
});

export default TaskState;
