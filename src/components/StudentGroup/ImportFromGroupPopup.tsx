import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import StudentGroup, { default as StudentGroupModel } from '@tdev-models/StudentGroup';
import Button from '../shared/Button';
import { mdiAccountArrowLeft } from '@mdi/js';
import Popup from 'reactjs-popup';
import { useStore } from '@tdev-hooks/useStore';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TextAreaInput from '@tdev-components/shared/TextAreaInput';

interface Props {
    studentGroup: StudentGroupModel;
    onImported: (ids: string[], fromGroup: StudentGroup) => void;
}

// TODO: Consider adding a second option (tab) to import form a list instead (i.e. email column in class excel file).
const ImportFromGroupPopup = observer((props: Props) => {
    const studentGroupStore = useStore('studentGroupStore');
    const userStore = useStore('userStore');
    const [searchFilter, setSearchFilter] = React.useState('');
    const [searchRegex, setSearchRegex] = React.useState(new RegExp(searchFilter, 'i'));
    const [idsToImportFromList, setIdsToImportFromList] = React.useState<string[]>([]);

    React.useEffect(() => {
        setSearchRegex(new RegExp(searchFilter, 'i'));
    }, [searchFilter]);

    return (
        <Popup
            trigger={
                <div>
                    <Button
                        className={clsx('button--block')}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                        icon={mdiAccountArrowLeft}
                        color="blue"
                        text="Importieren"
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
                    <TabItem value="fromGroup" label="Aus Gruppe">
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
                                                                    !props.studentGroup.students.includes(
                                                                        student
                                                                    )
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
                                                        color="blue"
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </TabItem>
                    <TabItem value="fromList" label="Aus Liste">
                        <div className={clsx('card__header', styles.header)}>
                            <h3>Aus Liste importieren</h3>
                        </div>
                        <div className={clsx(styles.importFromList)}>
                            <Button
                                text={`${idsToImportFromList.length} Mitglieder importieren`}
                                icon={mdiAccountArrowLeft}
                                iconSide="left"
                                color="blue"
                                disabled={idsToImportFromList.length === 0}
                                onClick={() => {}}
                            />
                            <TextAreaInput
                                onChange={(val) => {
                                    const ids = val
                                        .split('\n')
                                        .filter((line) => !!line)
                                        .map((line) => {
                                            if (line.includes('@')) {
                                                // We assume that this is an email. Try to find the corresponding user ID.
                                                return userStore.users.find((user) => user.email === line)
                                                    ?.id;
                                            }
                                            return line; // We assume that it's an ID.
                                        })
                                        .filter((id) => !!id && userStore.find(id)) as string[];

                                    setIdsToImportFromList(ids);
                                }}
                                className={clsx(styles.textArea)}
                                placeholder="Eine ID oder E-Mail pro Zeile"
                                monospace
                            />
                        </div>
                    </TabItem>
                </Tabs>
            </div>
        </Popup>
    );
});

export default ImportFromGroupPopup;
