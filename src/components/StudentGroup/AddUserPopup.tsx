import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import StudentGroup, { default as StudentGroupModel } from '@tdev-models/StudentGroup';
import Button from '../shared/Button';
import { mdiAccountArrowLeft, mdiAccountPlus } from '@mdi/js';
import Popup from 'reactjs-popup';
import { useStore } from '@tdev-hooks/useStore';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TextAreaInput from '@tdev-components/shared/TextAreaInput';
import { debounce } from 'lodash';
import User from '@tdev-models/User';
import Admonition from '@theme/Admonition';

interface Props {
    studentGroup: StudentGroupModel;
    onImported: (ids: string[], fromGroup: StudentGroup) => void;
}

const AddIndividualUsersPopup = observer((props: Props) => {
    const userStore = useStore('userStore');
    const [searchFilter, setSearchFilter] = React.useState('');
    const [searchRegex, setSearchRegex] = React.useState(new RegExp(searchFilter, 'i'));

    React.useEffect(() => {
        setSearchRegex(new RegExp(searchFilter, 'i'));
    }, [searchFilter]);

    const group = props.studentGroup;

    return (
        <>
            <div className={clsx('card__header', styles.header)}>
                <h3>Benutzer:in hinzufügen</h3>
            </div>
            <div className={clsx('card__body')}>
                <input
                    type="text"
                    placeholder="Suche..."
                    value={searchFilter}
                    className={clsx(styles.textInput)}
                    onChange={(e) => {
                        setSearchFilter(e.target.value);
                    }}
                />
                <div className={styles.listContainer}>
                    <ul className={clsx(styles.students, styles.list)}>
                        {userStore.users
                            .filter((user) => searchRegex.test(user.searchTerm))
                            .map((user, idx) => (
                                <li
                                    key={idx}
                                    className={clsx(
                                        styles.listItem,
                                        group.userIds.has(user.id) && styles.disabled
                                    )}
                                    title={user.email}
                                >
                                    {user.nameShort}
                                    <div className={styles.actions}>
                                        <Button
                                            onClick={() => {
                                                group.addStudent(user);
                                            }}
                                            disabled={group.userIds.has(user.id)}
                                            icon={mdiAccountPlus}
                                            color="green"
                                        />
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </>
    );
});

const ImportFromGroupPopup = observer((props: Props) => {
    const studentGroupStore = useStore('studentGroupStore');
    const [searchFilter, setSearchFilter] = React.useState('');
    const [searchRegex, setSearchRegex] = React.useState(new RegExp(searchFilter, 'i'));

    React.useEffect(() => {
        setSearchRegex(new RegExp(searchFilter, 'i'));
    }, [searchFilter]);

    return (
        <>
            <div className={clsx('card__header', styles.header)}>
                <h3>Aus Gruppe importieren</h3>
            </div>
            <div className={clsx('card__body')}>
                <input
                    type="text"
                    placeholder="Suche..."
                    value={searchFilter}
                    className={clsx(styles.textInput)}
                    onChange={(e) => {
                        setSearchFilter(e.target.value);
                    }}
                />
                <div className={styles.listContainer}>
                    <ul className={clsx(styles.students, styles.list)}>
                        {studentGroupStore.managedStudentGroups
                            .filter((group) => group.id !== props.studentGroup.id)
                            .filter((user) => searchRegex.test(user.searchTerm))
                            .map((group, idx) => (
                                <li
                                    key={idx}
                                    className={clsx(
                                        styles.listItem,
                                        group.userIds.has(group.id) && styles.disabled
                                    )}
                                    title={group.name}
                                >
                                    {group.name}
                                    <div className={styles.actions}>
                                        <Button
                                            onClick={() => {
                                                const studentsToImport = group.students.filter(
                                                    (student) =>
                                                        !props.studentGroup.students.includes(student)
                                                );
                                                studentsToImport.forEach((student) =>
                                                    props.studentGroup.addStudent(student)
                                                );
                                                props.onImported(
                                                    studentsToImport.map((student) => student.id),
                                                    group
                                                );
                                            }}
                                            disabled={group.userIds.has(group.id)}
                                            icon={mdiAccountArrowLeft}
                                            color="green"
                                        />
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </>
    );
});

const ImportFromListPopup = observer((props: Props) => {
    const userStore = useStore('userStore');
    const [idsToImport, setIdsToImport] = React.useState<Set<string>>(new Set());
    const [invalidEntries, setInvalidEntries] = React.useState<string[]>([]);
    const [numDuplicatesSkipped, setNumDuplicatesSkipped] = React.useState<number>(0);

    return (
        <>
            <div className={clsx('card__header', styles.header)}>
                <h3>Aus Liste importieren</h3>
            </div>
            <div className={clsx(styles.importFromList)}>
                <Button
                    text={`${idsToImport.size} Mitglied(er) hinzufügen`}
                    icon={mdiAccountArrowLeft}
                    iconSide="left"
                    color="green"
                    disabled={idsToImport.size === 0 || invalidEntries.length > 0}
                    onClick={() => {}}
                />
                <TextAreaInput
                    onChange={debounce((val) => {
                        const newInvalidEntries: string[] = [];
                        let duplicatesSkipped = 0;
                        const ids = val
                            .split('\n')
                            .filter((emailOrId: string) => !!emailOrId)
                            .map((line: string) => {
                                const user = line.includes('@')
                                    ? userStore.users.find((user) => user.email === line)
                                    : userStore.find(line);

                                if (!user) {
                                    newInvalidEntries.push(line);
                                    return undefined;
                                }

                                return user;
                            })
                            .filter((user: User) => {
                                if (!user) {
                                    return false;
                                }
                                if (props.studentGroup.students.includes(user)) {
                                    duplicatesSkipped++;
                                    return false;
                                }
                                return true;
                            })
                            .map((user: User) => user.id) as string[];

                        setIdsToImport(new Set(ids));
                        setInvalidEntries(newInvalidEntries);
                        setNumDuplicatesSkipped(duplicatesSkipped);
                    }, 300)}
                    className={clsx(styles.textArea)}
                    placeholder="Eine ID oder E-Mail pro Zeile"
                    monospace
                />
                {invalidEntries.length > 0 && (
                    <Admonition type="warning" title="Ungültige Einträge">
                        <ul>
                            {invalidEntries.map((entry) => (
                                <li>{entry}</li>
                            ))}
                        </ul>
                    </Admonition>
                )}

                {numDuplicatesSkipped > 0 && (
                    <Admonition type="info" title="Duplikate">
                        {numDuplicatesSkipped} Benutzer:innen sind bereits Mitglied dieser Gruppe und werden
                        ignoriert.
                    </Admonition>
                )}
            </div>
        </>
    );
});

const AddUserPopup = observer((props: Props) => {
    return (
        <Popup
            trigger={
                <div>
                    <Button
                        className={clsx('button--block')}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                        icon={mdiAccountPlus}
                        color="green"
                        text="Hinzufügen"
                        iconSide="left"
                    />
                </div>
            }
            on="click"
            closeOnDocumentClick
            closeOnEscape
        >
            <div className={clsx(styles.wrapper, 'card')}>
                <Tabs>
                    <TabItem value="add" label="Benutzer:in hinzufügen">
                        <AddIndividualUsersPopup {...props} />
                    </TabItem>
                    <TabItem value="fromGroup" label="Aus Gruppe">
                        <ImportFromGroupPopup {...props} />
                    </TabItem>
                    <TabItem value="fromList" label="Aus Liste">
                        <ImportFromListPopup {...props} />
                    </TabItem>
                </Tabs>
            </div>
        </Popup>
    );
});

export default AddUserPopup;
