import React from 'react';
import clsx from 'clsx';
import styles from '../AccessPanel.module.scss';
import { observer } from 'mobx-react-lite';
import DocumentRoot from '@site/src/models/DocumentRoot';
import { useStore } from '@site/src/hooks/useStore';
import UserPermission from '.';
import { mdiAccountCircle } from '@mdi/js';
import AccessSelector from '../AccessSelector';
import Icon from '@mdi/react';
import Loader from '../../Loader';

interface Props {
    documentRoot: DocumentRoot<any>;
}

const AccessPanel = observer((props: Props) => {
    const { documentRoot } = props;
    const userStore = useStore('userStore');
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
        <div className={clsx(styles.panel)}>
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
                    {documentRoot.userPermissions
                        .filter((permission) =>
                            permission.user?.searchTerm ? searchRegex.test(permission.user.searchTerm) : true
                        )
                        .map((userPermission, idx) => (
                            <div key={userPermission.id} className={clsx(styles.item)}>
                                <UserPermission key={idx} permission={userPermission} />
                            </div>
                        ))}
                    {userStore.users
                        .filter(
                            (user) =>
                                searchRegex.test(user.searchTerm) &&
                                !documentRoot.userPermissions.some((p) => p.userId === user.id)
                        )
                        .map((user, idx) => (
                            <div key={idx} className={clsx(styles.item)}>
                                <span className={styles.audience}>{user.nameShort}</span>
                                <span className={clsx(styles.spacer)} />
                                <div className={styles.actions}>
                                    <AccessSelector
                                        onChange={(access) => {
                                            permissionStore.createUserPermission(documentRoot, user, access);
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
