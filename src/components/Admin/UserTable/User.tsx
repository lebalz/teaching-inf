import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as UserModel } from '@site/src/models/User';
import CopyBadge from '../../shared/CopyBadge';
import { formatDateTime } from '@site/src/models/helpers/date';
import Icon from '@mdi/react';
import { mdiCircle, mdiSizeS } from '@mdi/js';

interface Props {
    user: UserModel;
}

const UserTableRow = observer((props: Props) => {
    const { user } = props;
    return (
        <tr className={clsx(styles.user)}>
            <td>
                <div className={clsx(styles.clients)}>
                    <Icon
                        path={mdiCircle}
                        size={0.6}
                        color={user.connectedClients ? 'var(--ifm-color-success)' : 'var(--ifm-color-danger)'}
                    />
                    {user.connectedClients > 0 && (
                        <span className={clsx('badge badge--primary')}>{user.connectedClients}</span>
                    )}
                </div>
            </td>
            <td>{user.email}</td>
            <td>
                <div className={clsx(styles.role, 'button-group')}>
                    {['Admin', 'User'].map((role, idx) => (
                        <button
                            key={idx}
                            className={clsx(
                                'button',
                                'button--sm',
                                user.isAdmin
                                    ? role === 'Admin'
                                        ? 'button--primary'
                                        : 'button--secondary'
                                    : role === 'User'
                                      ? 'button--primary'
                                      : 'button--secondary'
                            )}
                            onClick={() => {
                                user.setAdmin(role === 'Admin');
                            }}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{formatDateTime(user.createdAt)}</td>
            <td>{formatDateTime(user.updatedAt)}</td>
            <td>
                <CopyBadge value={user.id} />
            </td>
        </tr>
    );
});

export default UserTableRow;
