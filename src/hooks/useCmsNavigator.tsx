import React from 'react';
import { useStore } from './useStore';
import { useHistory } from 'react-router';

export const useCmsNavigator = () => {
    const cmsStore = useStore('cmsStore');
    const history = useHistory();
    const openFile = React.useMemo(() => {
        return (branch: string | undefined, activePath?: string | null) =>
            history.push(
                `/cms/${cmsStore.repoOwner}/${cmsStore.repoName}/${activePath ?? ''}${branch ? `?ref=${branch}` : ''}`
            );
    }, [cmsStore.repoOwner, cmsStore.repoName, history]);
    return { openFile };
};
