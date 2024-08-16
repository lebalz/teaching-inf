import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as StudentGroupModel } from '@site/src/models/StudentGroup';
import Button from '../shared/Button';
import {
    mdiAccountMinus,
    mdiAccountPlus,
    mdiAccountReactivate,
    mdiAccountReactivateOutline,
    mdiAccountRemove,
    mdiAccountRemoveOutline,
    mdiMinusCircle
} from '@mdi/js';
import Popup from 'reactjs-popup';
import { useStore } from '@site/src/hooks/useStore';
import AddUserPopup from './AddUserPopup';

interface Props {
    studentGroup: StudentGroupModel;
}

const StudentGroup = observer((props: Props) => {
    const [removedIds, setRemovedIds] = React.useState<string[]>([]);
    React.useEffect(() => {
        // const timeout = setTimeout(() => {
        //     setRemovedIds([]);
        // }, 5000);
        // return () => clearTimeout(timeout);
    }, [removedIds]);
    const group = props.studentGroup;
    const userStore = useStore('userStore');
    return (
        <div className={clsx(styles.studentGroup, 'card')}>
            <div className={clsx('card__header')}>
                <h3>{group.name}</h3>
            </div>
            <div className={clsx('card__body')}>
                <dl>
                    <dt>Beschreibung</dt>
                    <dd>{group.description || '-'}</dd>

                    <dt>Erstellt Am</dt>
                    <dd>{group.fCreatedAt}</dd>

                    <dt>Letzte Änderung</dt>
                    <dd>{group.fUpdatedAt}</dd>

                    <dt>User:innen</dt>
                    <dd>
                        <AddUserPopup studentGroup={group} />
                        <div className={styles.listContainer}>
                            <ul className={clsx(styles.students, styles.list)}>
                                {group.students.map((student, idx) => (
                                    <li key={idx} className={clsx(styles.listItem)}>
                                        {student.email}
                                        <div className={styles.actions}>
                                            <Button
                                                onClick={() => {
                                                    group.removeStudent(student);
                                                    setRemovedIds([...new Set([...removedIds, student.id])]);
                                                }}
                                                icon={mdiAccountMinus}
                                                color="red"
                                                title="Entfernen"
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {removedIds.map((removedId) => (
                            <div
                                className={clsx('alert alert--warning', styles.removeAlert)}
                                role="alert"
                                key={removedId}
                            >
                                <button
                                    aria-label="Close"
                                    className={clsx('clean-btn close')}
                                    type="button"
                                    onClick={() => setRemovedIds(removedIds.filter((id) => id !== removedId))}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                Benutzer:in <strong>{userStore.find(removedId)?.email}</strong> wurde
                                entfernt.
                                <Button
                                    onClick={() => {
                                        const user = userStore.find(removedId);
                                        if (user) {
                                            group.addStudent(user);
                                        }
                                        setRemovedIds(removedIds.filter((id) => id !== removedId));
                                    }}
                                    icon={mdiAccountReactivateOutline}
                                    text="Rückgängig"
                                    className={clsx('button--block')}
                                    iconSide="left"
                                    color="primary"
                                />
                            </div>
                        ))}
                    </dd>
                </dl>
            </div>
        </div>
    );
});

export default StudentGroup;
