import { useStore } from '@tdev-hooks/useStore';
import FileStub from '@tdev-models/cms/FileStub';
import React from 'react';
const isRelPath = (path?: string) => {
    if (!path) {
        return false;
    }
    if (path.startsWith('.')) {
        return true;
    }
    if (path.startsWith('/')) {
        return false;
    }
    if (path.startsWith('https://') || path.startsWith('http://')) {
        return false;
    }
    if (path.startsWith('pathname:///')) {
        return false;
    }
    return true;
};
export const useAssetFile = (relPath: string) => {
    const cmsStore = useStore('cmsStore');
    const { editedFile } = cmsStore;
    const isRelAsset = React.useMemo(() => {
        return isRelPath(relPath);
    }, [relPath]);
    // editedFile.findEntryByRelativePath(relPath);

    const path = React.useMemo(() => {
        if (!isRelAsset) {
            return undefined;
        }
        return editedFile?.resolvePath(relPath);
    }, [relPath, isRelAsset, editedFile]);

    React.useEffect(() => {
        const { branch } = editedFile || {};
        if (branch && path && !cmsStore.findEntry(branch, path)) {
            cmsStore.fetchFile(FileStub.DummyFile(path, branch, cmsStore, true)); // TODO: set it to true?
        }
    }, [editedFile, path, cmsStore]);

    return cmsStore.findEntry(editedFile?.branch, path);
};
