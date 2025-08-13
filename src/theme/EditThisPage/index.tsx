import React, { type ReactNode } from 'react';
import Translate from '@docusaurus/Translate';
import { ThemeClassNames } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import styles from './styles.module.scss';
import siteConfig from '@generated/docusaurus.config';
import type { Props } from '@theme/EditThisPage';
import Icon from '@mdi/react';
import { mdiGithub, mdiInfinity, mdiMicrosoftVisualStudioCode } from '@mdi/js';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { useLocation } from '@docusaurus/router';
const { organizationName, projectName } = siteConfig;
const GH_EDIT_URL = `https://github.com/${organizationName}/${projectName}/edit/main/`;
const GH_DEV_EDIT_URL = `https://github.dev/${organizationName}/${projectName}/blob/main/`;
const CMS_EDIT_URL = `/cms/${organizationName}/${projectName}/`;

const EditThisPage = observer(({ editUrl }: Props): ReactNode => {
    const userStore = useStore('userStore');
    const location = useLocation();
    const search = new URLSearchParams(location.search);
    if (!editUrl || (!userStore.current?.hasElevatedAccess && !search.has('edit'))) {
        return null;
    }
    return (
        <div className={clsx(styles.editThisPage)}>
            <Link
                to={`${GH_EDIT_URL}${editUrl}`}
                className={clsx(ThemeClassNames.common.editThisPage, styles.edit)}
            >
                <Icon path={mdiGithub} size={0.7} />
                Github
            </Link>
            <Link
                to={`${GH_DEV_EDIT_URL}${editUrl}`}
                className={clsx(ThemeClassNames.common.editThisPage, styles.edit)}
            >
                <Icon path={mdiMicrosoftVisualStudioCode} size={0.7} />
                .dev
            </Link>
            <Link
                to={`${CMS_EDIT_URL}${editUrl}`}
                className={clsx(ThemeClassNames.common.editThisPage, styles.edit)}
            >
                <Icon path={mdiInfinity} size={0.7} />
                cms
            </Link>
        </div>
    );
});

export default EditThisPage;
