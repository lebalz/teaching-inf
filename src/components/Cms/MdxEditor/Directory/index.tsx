import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as DirModel } from '@tdev-models/cms/Dir';
import Card from '@tdev-components/shared/Card';
import Dir from '@tdev-components/Cms/Github/iFile/Dir';
import Avatar from '@tdev-components/shared/Avatar';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { mdiLogout, mdiLogoutVariant } from '@mdi/js';

interface Props {
    dir?: DirModel;
    className?: string;
    contentClassName?: string;
    showActions?: 'always' | 'hover';
    compact?: boolean;
}

const Directory = observer((props: Props) => {
    const { dir } = props;
    const cmsStore = useStore('cmsStore');
    const { github } = cmsStore;
    React.useEffect(() => {
        if (dir && !dir.isOpen) {
            console.log('Open from Directory.tsx');
            dir.setOpen(true);
        }
    }, [dir]);
    if (!dir) {
        return null;
    }

    return (
        <div className={clsx(styles.directory, props.className, props.compact && styles.compact)}>
            {github?.user && (
                <div className={clsx(styles.ghUser)}>
                    <Avatar
                        imgSrc={github.user.avatar_url}
                        name={github.user.login}
                        size="sm"
                        href={github.user.html_url}
                        className={clsx(styles.avatar)}
                        description={
                            <a
                                href={
                                    cmsStore.activeBranch?.PR
                                        ? cmsStore.activeBranch.PR.htmlUrl
                                        : github.repo?.html_url
                                }
                                target="_blank"
                            >
                                {`${cmsStore.organizationName}/${cmsStore.projectName}`}
                            </a>
                        }
                    />
                    <Button
                        onClick={() => {
                            cmsStore.logoutGithub();
                        }}
                        icon={mdiLogoutVariant}
                        title="Logout"
                    />
                </div>
            )}
            <Card
                classNames={{
                    body: styles.cardBody,
                    card: props.contentClassName
                }}
            >
                <ul className={clsx(styles.dirTree)}>
                    <Dir dir={dir} showActions={props.showActions} />
                </ul>
            </Card>
        </div>
    );
});

export default Directory;
