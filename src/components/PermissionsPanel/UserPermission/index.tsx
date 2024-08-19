import React from 'react';
import clsx from 'clsx';
import styles from '../Permission.module.scss';
import { observer } from 'mobx-react-lite';
import PermissionUser from '@site/src/models/PermissionUser';
import AccessSelector from '../AccessSelector';
import Button from '../../shared/Button';
import { mdiDelete } from '@mdi/js';

interface Props {
    permission: PermissionUser;
}

const UserPermission = observer((props: Props) => {
    const { permission } = props;
    return (
        <div className={clsx(styles.permission)}>
            <span className={clsx(styles.audience)}>{permission.user?.nameShort || permission.id}</span>
            <span className={clsx(styles.spacer)} />
            <AccessSelector
                access={permission.access}
                onChange={(access) => {
                    permission.access = access;
                }}
            />
            <span className={clsx(styles.actions)}>
                <Button
                    onClick={() => {
                        permission.delete();
                    }}
                    color="red"
                    icon={mdiDelete}
                />
            </span>
        </div>
    );
});

export default UserPermission;
