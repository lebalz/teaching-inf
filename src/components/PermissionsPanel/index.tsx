import React from 'react';
import Popup from 'reactjs-popup';
import styles from './styles.module.scss';
import Button from '@tdev-components/shared/Button';
import { mdiShieldLockOutline } from '@mdi/js';
import { observer } from 'mobx-react-lite';
import { Access } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import clsx from 'clsx';
import AccessSelector from './AccessSelector';
import { default as UserAccessPanel } from './UserPermission/AccessPanel';
import { default as GroupAccessPanel } from './GroupPermission/AccessPanel';
import DefinitionList from '../DefinitionList';
import { action } from 'mobx';
import UserPermission from '@tdev-components/PermissionsPanel/UserPermission';
import { PopupPosition } from 'reactjs-popup/dist/types';
import useIsMobileView from '@tdev-hooks/useIsMobileView';

interface BaseProps {
    position?: PopupPosition | PopupPosition[];
    className?: string;
}
interface SingleDocRootProps extends BaseProps {
    documentRootId: string;
    documentRootIds?: never;
}
interface MultiDocRootProps extends BaseProps {
    documentRootIds: string[];
    documentRootId?: never;
}

type Props = SingleDocRootProps | MultiDocRootProps;

const PermissionsPanel = observer((props: Props) => {
    const { documentRootId, documentRootIds, position } = props;
    const docRootIds = documentRootIds || [documentRootId];
    const [isOpen, setIsOpen] = React.useState(false);
    const userStore = useStore('userStore');
    const documentRootStore = useStore('documentRootStore');
    const permissionStore = useStore('permissionStore');
    const isMobileView = useIsMobileView(470);
    const documentRoots = docRootIds.map((did) => documentRootStore.find(did)).filter((x) => !!x);
    const { viewedUser } = userStore;

    if (!userStore.current?.isAdmin || documentRoots.length === 0) {
        return null;
    }
    const firstRoot = documentRoots[0];

    if (viewedUser && viewedUser !== userStore.current) {
        const userPermissions = documentRoots
            .map((dr) =>
                permissionStore
                    .userPermissionsByDocumentRoot(dr.id)
                    .find((permission) => permission.userId === viewedUser.id)
            )
            .filter((x) => !!x);
        return (
            <div
                className={clsx(styles.viewedUserPermissionPanel, props.className)}
                onClick={(e) => e.stopPropagation()}
            >
                {userPermissions.length === documentRoots.length ? (
                    <UserPermission permissions={userPermissions} />
                ) : (
                    <span
                        className={clsx('badge', 'badge--warning')}
                    >{`Nur ${userPermissions.length}/${documentRoots.length} Berechtiungen gefunden.`}</span>
                )}
            </div>
        );
    }

    return (
        <Popup
            trigger={
                <span className={clsx(props.className)}>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                        icon={mdiShieldLockOutline}
                        noOutline={isOpen}
                        color={isOpen ? 'primary' : 'secondary'}
                    />
                </span>
            }
            on="click"
            closeOnDocumentClick
            overlayStyle={{ background: isMobileView ? 'rgba(0,0,0,0.5)' : undefined }}
            closeOnEscape
            position={
                position || [
                    'bottom right',
                    'bottom left',
                    'bottom center',
                    'left center',
                    'top left',
                    'top right',
                    'right center',
                    'top center'
                ]
            }
            keepTooltipInside=".markdown"
            modal={isMobileView}
            onOpen={action(() => {
                documentRoots.forEach((dr) => permissionStore.loadPermissions(dr));
                setIsOpen(true);
            })}
            onClose={() => setIsOpen(false)}
        >
            <div className={clsx(styles.wrapper, 'card')}>
                <div className={clsx('card__header', styles.header)}>
                    <h3>Berechtigungen Festlegen</h3>
                </div>
                <div className={clsx('card__body', styles.cardBody)}>
                    <DefinitionList className={styles.popupContentContainer} small>
                        <dt>Allgemeine Berechtigung</dt>
                        <dd>
                            <AccessSelector
                                accessTypes={[
                                    Access.RO_DocumentRoot,
                                    Access.RW_DocumentRoot,
                                    Access.None_DocumentRoot
                                ]}
                                access={
                                    documentRoots.every((dr) => dr.rootAccess === firstRoot.rootAccess)
                                        ? firstRoot.rootAccess
                                        : undefined
                                }
                                onChange={(access) => {
                                    documentRoots.forEach((dr) => {
                                        dr.setRootAccess(access);
                                        dr.save();
                                    });
                                }}
                            />
                        </dd>
                        <dt>Für geteilte Dokumente (default: None)</dt>
                        <dd>
                            <AccessSelector
                                accessTypes={[
                                    Access.RO_DocumentRoot,
                                    Access.RW_DocumentRoot,
                                    Access.None_DocumentRoot
                                ]}
                                access={
                                    documentRoots.every((dr) => dr.rootAccess === firstRoot.rootAccess)
                                        ? firstRoot.rootAccess
                                        : undefined
                                }
                                onChange={(access) => {
                                    documentRoots.forEach((dr) => {
                                        dr.setSharedAccess(access);
                                        dr.save();
                                    });
                                }}
                            />
                        </dd>
                        <dt>Gruppen-Berechtigungen</dt>
                        <dd>
                            <GroupAccessPanel documentRoots={documentRoots} />
                        </dd>
                        <dt>User-Berechtigungen</dt>
                        <dd>
                            <UserAccessPanel documentRoots={documentRoots} />
                        </dd>
                    </DefinitionList>
                </div>
            </div>
        </Popup>
    );
});

export default PermissionsPanel;
