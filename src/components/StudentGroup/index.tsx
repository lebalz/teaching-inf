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
    mdiCircleEditOutline,
    mdiCloseCircleOutline,
    mdiContentSave,
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
    const [editing, setEditing] = React.useState(false);
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setRemovedIds([]);
        }, 5000);
        return () => clearTimeout(timeout);
    }, [removedIds]);
    const group = props.studentGroup;
    const userStore = useStore('userStore');
    return (
        <div className={clsx(styles.studentGroup, 'card')}>
            <div className={clsx('card__header', styles.header)}>
                <h3>
                    {editing ? (
                        <input
                            type="text"
                            placeholder="Titel..."
                            value={group.name}
                            className={clsx(styles.textInput)}
                            onChange={(e) => {
                                group.setName(e.target.value);
                            }}
                        />
                    ) : (
                        group.name || '-'
                    )}
                </h3>
                {editing ? (
                    <div>
                        <Button
                            onClick={() => {
                                group.reset();
                                setEditing(false);
                            }}
                            icon={mdiCloseCircleOutline}
                            color="black"
                            title="Verwerfen"
                        />
                        <Button
                            onClick={() => {
                                group.save();
                                setEditing(false);
                            }}
                            icon={mdiContentSave}
                            color="green"
                            title="Speichern"
                        />
                    </div>
                ) : (
                    <Button
                        onClick={() => {
                            setEditing(!editing);
                            setEditing(true);
                        }}
                        icon={mdiCircleEditOutline}
                        color="orange"
                        title="Bearbeiten"
                    />
                )}
            </div>
            <div className={clsx('card__body')}>
                <dl>
                    <dt>Beschreibung</dt>
                    <dd>
                        {editing ? (
                            <textarea
                                placeholder="Beschreibung..."
                                value={group.description}
                                className={clsx(styles.textarea)}
                                onChange={(e) => {
                                    group.setDescription(e.target.value);
                                }}
                            />
                        ) : (
                            group.description || '-'
                        )}
                    </dd>

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
