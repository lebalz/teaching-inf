import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as StudentGroupModel } from '@site/src/models/StudentGroup';
import Button from '../shared/Button';
import {
    mdiAccountMinus,
    mdiAccountReactivateOutline,
    mdiCircleEditOutline,
    mdiCloseCircleOutline,
    mdiContentSave,
    mdiTrashCanOutline
} from '@mdi/js';
import { useStore } from '@site/src/hooks/useStore';
import AddUserPopup from './AddUserPopup';
import DefinitionList from '../DefinitionList';

interface Props {
    studentGroup: StudentGroupModel;
}

const StudentGroup = observer((props: Props) => {
    const [removedIds, setRemovedIds] = React.useState<string[]>([]);
    const [editing, setEditing] = React.useState(false);
    const user = useStore('userStore').current;
    const groupStore = useStore('studentGroupStore');
    const isAdmin = !!user?.isAdmin;
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
                    {isAdmin && editing ? (
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
                {isAdmin && (
                    <div>
                        {editing ? (
                            <>
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
                                <Button
                                    onClick={() => {
                                        groupStore.destroy(group);
                                    }}
                                    icon={mdiTrashCanOutline}
                                    color="red"
                                    title="Löschen"
                                />
                            </>
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
                )}
            </div>
            <div className={clsx('card__body')}>
                <DefinitionList>
                    <dt>Beschreibung</dt>
                    <dd>
                        {isAdmin && editing ? (
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

                    <dt>Anzahl Schüler:innen</dt>
                    <dd>
                        <span className={clsx('badge badge--primary')}>
                            {group.students.filter((u) => !u.isAdmin).length}
                        </span>
                    </dd>

                    <dt>Lehrpersonen</dt>
                    <dd>
                        <ul>
                            {group.students
                                .filter((u) => u.isAdmin)
                                .map((user, idx) => (
                                    <li key={idx}>
                                        {user.firstName.slice(0, 1)}. {user.lastName}
                                    </li>
                                ))}
                        </ul>
                    </dd>

                    <dt>Gruppe</dt>
                    <dd>
                        {isAdmin && <AddUserPopup studentGroup={group} />}
                        <div className={styles.listContainer}>
                            <ul className={clsx(styles.students, styles.list)}>
                                {group.students.map((student, idx) => (
                                    <li key={idx} className={clsx(styles.listItem)}>
                                        {student.email}
                                        {isAdmin && (
                                            <div className={styles.actions}>
                                                <Button
                                                    onClick={() => {
                                                        group.removeStudent(student);
                                                        setRemovedIds([
                                                            ...new Set([...removedIds, student.id])
                                                        ]);
                                                    }}
                                                    icon={mdiAccountMinus}
                                                    color="red"
                                                    title="Entfernen"
                                                />
                                            </div>
                                        )}
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
                </DefinitionList>
            </div>
        </div>
    );
});

export default StudentGroup;
