import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@site/src/hooks/useStore';
import Button from '@site/src/components/shared/Button';
import { mdiCheckboxMultipleMarkedCircle } from '@mdi/js';
import { Access, StateType } from '@site/src/api/document';
import Icon from '@mdi/react';
import Popup from 'reactjs-popup';
import TaskStateList from './TaskStateList';

export const mdiColor: { [key in StateType]: string } = {
    checked: '--ifm-color-success',
    unset: '--ifm-color-secondary-contrast-foreground',
    question: '--ifm-color-warning',
    star: '--ifm-color-primary',
    ['star-empty']: '--ifm-color-primary',
    ['star-half']: '--ifm-color-primary'
};

interface OverviewIconProps {
    allChecked: boolean;
    someChecked: boolean;
}
const OverviewIcon = (props: OverviewIconProps) => {
    return (
        <Icon
            path={mdiCheckboxMultipleMarkedCircle}
            size={1}
            color={
                props.allChecked
                    ? 'var(--ifm-color-success)'
                    : props.someChecked
                      ? 'var(--ifm-color-warning)'
                      : 'var(--ifm-color-secondary-darkest)'
            }
        />
    );
};

const TaskStateOverview = observer(() => {
    const userStore = useStore('userStore');
    const pageStore = useStore('pageStore');
    const current = userStore.current;
    const currentPage = pageStore.current;
    if (!current || !currentPage) {
        return null;
    }
    const taskStates = currentPage.taskStates.filter((ts) => ts.root?.access === Access.RW) || [];
    const someChecked = taskStates.some((d) => d.taskState === 'checked');
    const allChecked = someChecked && taskStates.every((d) => d.taskState === 'checked');
    return (
        <div className={clsx(styles.taskStateOverview)}>
            {current.isAdmin ? (
                <Popup
                    trigger={
                        <span className={styles.icon}>
                            <Button icon={mdiCheckboxMultipleMarkedCircle} size={1} color="primary" />
                        </span>
                    }
                    onOpen={() => {
                        currentPage.loadOverview();
                    }}
                    nested
                >
                    <div className={clsx('card')}>
                        <div className={clsx('card__body')}>
                            <div>
                                {Object.values(currentPage.taskStatesByUsers).map((docs, idx) => {
                                    return (
                                        <div key={idx} className={clsx(styles.usersTaskStates)}>
                                            {docs[0].author?.nameShort}
                                            <TaskStateList taskStates={docs} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Popup>
            ) : (
                <span className={styles.icon}>
                    <OverviewIcon allChecked={allChecked} someChecked={someChecked} />
                </span>
            )}
            <TaskStateList taskStates={taskStates} />
        </div>
    );
});

export default TaskStateOverview;
