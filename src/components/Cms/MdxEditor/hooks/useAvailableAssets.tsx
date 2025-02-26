import { useStore } from '@tdev-hooks/useStore';
import { Asset } from '@tdev-models/cms/Dir';
import FileStub from '@tdev-models/cms/FileStub';
import { ApiState } from '@tdev-stores/iStore';
import React from 'react';
export const isRelPath = (path?: string) => {
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
export const useAvailableAssets = (asset: Asset) => {
    const cmsStore = useStore('cmsStore');
    const { editedFile } = cmsStore;
    React.useLayoutEffect(() => {
        const parent = editedFile?.parent;
        if (!parent) {
            return;
        }
        parent.
        const assetDir = asset === Asset.IMAGE ? parent.imageDir : parent.assetDir;
        if (assetDir && !assetDir.isSyncing) {
            console.log('fetching asset dir');
            assetDir.fetchDirectory().then((dir) => {
                if (dir) {
                    dir.children.forEach((img) => {
                        if (img.type === 'file_stub' && !img.isSyncing) {
                            img.fetchContent();
                        }
                    });
                }
            });
        }
    }, [editedFile, asset]);
};
