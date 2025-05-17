import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as StudentGroupModel } from '@tdev-models/StudentGroup';
import Button from '../shared/Button';
import { mdiAccountArrowLeft, mdiAccountPlus } from '@mdi/js';
import Popup from 'reactjs-popup';
import { useStore } from '@tdev-hooks/useStore';

interface Props {
    studentGroup: StudentGroupModel;
}

// TODO: Consider adding a second option (tab) to import form a list instead (i.e. email column in class excel file).
const AddUserPopup = observer((props: Props) => {
    const studentGroupStore = useStore('studentGroupStore');
    const [searchFilter, setSearchFilter] = React.useState('');
    const [searchRegex, setSearchRegex] = React.useState(new RegExp(searchFilter, 'i'));
    React.useEffect(() => {
        setSearchRegex(new RegExp(searchFilter, 'i'));
    }, [searchFilter]);
    const group = props.studentGroup;
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
                                                    group.students.forEach((student) =>
                                                        props.studentGroup.addStudent(student)
                                                    );
                                                    // TODO: Maybe add confirmation or undo?
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
            </div>
        </Popup>
    );
});

export default AddUserPopup;
