import React from 'react';
import clsx from 'clsx';
import styles from '../AccessPanel.module.scss';
import { observer } from 'mobx-react-lite';
import DocumentRoot from '@site/src/models/DocumentRoot';
import { useStore } from '@site/src/hooks/useStore';
import GroupPermission from '.';
import { mdiAccountSupervisorCircle } from '@mdi/js';
import AccessSelector from '../AccessSelector';
import Icon from '@mdi/react';
import Loader from '../../Loader';

interface Props {
    documentRoot: DocumentRoot<any>;
}

const AccessPanel = observer((props: Props) => {
    const { documentRoot } = props;
    const studentGroupStore = useStore('studentGroupStore');
    const permissionStore = useStore('permissionStore');
    const [searchFilter, setSearchFilter] = React.useState('');
    const [searchRegex, setSearchRegex] = React.useState(new RegExp(searchFilter, 'i'));
    React.useEffect(() => {
        setSearchRegex(new RegExp(searchFilter, 'i'));
    }, [searchFilter]);
    if (documentRoot.isDummy) {
        return <div>-</div>;
    }
    return (
        <div>
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
                <div className={clsx(styles.list)}>
                    {documentRoot.groupPermissions
                        .filter((permission) =>
                            permission.group?.searchTerm
                                ? searchRegex.test(permission.group.searchTerm)
                                : true
                        )
                        .map((groupPermission, idx) => (
                            <div key={groupPermission.id} className={clsx(styles.item)}>
                                <GroupPermission key={idx} permission={groupPermission} />
                            </div>
                        ))}
                    {studentGroupStore.studentGroups
                        .filter(
                            (group) =>
                                searchRegex.test(group.searchTerm) &&
                                !documentRoot.groupPermissions.some((p) => p.groupId === p.id)
                        )
                        .map((group, idx) => (
                            <div key={idx} className={clsx(styles.item)}>
                                <span className={styles.audience}>
                                    <Icon
                                        path={mdiAccountSupervisorCircle}
                                        color="var(--ifm-color-primary)"
                                        size={0.8}
                                    />
                                    {group.name}
                                </span>
                                <span className={clsx(styles.spacer)} />
                                <div className={styles.actions}>
                                    <AccessSelector
                                        onChange={(access) => {
                                            permissionStore.createGroupPermission(
                                                documentRoot,
                                                group,
                                                access
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            {!permissionStore.permissionsLoadedForDocumentRootIds.has(documentRoot.id) && <Loader overlay />}
        </div>
    );
});

export default AccessPanel;
