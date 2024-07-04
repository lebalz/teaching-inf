import React from 'react';
import { StoresProvider, rootStore } from '../stores/rootStore';
import { usePluginData } from '@docusaurus/useGlobalData';
import { DocumentStore } from '../stores/documentStore';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Root({children}) {
    const {libDir, syncMaxOnceEvery} = usePluginData('docusaurus-live-brython') as { libDir: string; syncMaxOnceEvery: number; };
    const {siteConfig} = useDocusaurusContext();
    React.useEffect(() => {
        /**
         * Expose the store to the window object
         */
        (window as any).store = rootStore;
        /**
         * Set some configuration options
         */
        DocumentStore.syncMaxOnceEvery = syncMaxOnceEvery;
        DocumentStore.libDir = libDir;
        DocumentStore.router = siteConfig.future.experimental_router;
    }, [rootStore]);
    return (
        <StoresProvider value={rootStore}>
            {children}
        </StoresProvider>
    )
}