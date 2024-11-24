import React from 'react';
import { observer } from 'mobx-react-lite';
import Excalidoc, { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { Source } from '@tdev-models/iDocument';
import { reaction } from 'mobx';
import { useColorMode } from '@docusaurus/theme-common';
import type { default as ExcalidrawLib } from '@excalidraw/excalidraw';
import _ from 'lodash';
import { DEFAULT_HEIGHT } from '..';
import clsx from 'clsx';
import styles from './styles.module.scss';
import SyncStatus from '@tdev-components/SyncStatus';
import Button from '@tdev-components/shared/Button';
import { mdiClose } from '@mdi/js';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';

export interface Props extends MetaInit {
    Lib: typeof ExcalidrawLib;
    id: string;
    meta: ModelMeta;
}

const Editor = observer((props: Props) => {
    const { Lib, meta } = props;
    const excalidoc = useFirstRealMainDocument(props.id, meta);
    const renderedSceneVersion = React.useRef(0);
    const initialized = React.useRef<boolean>(false);
    const apiSceneVersion = React.useRef(0);
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI>();
    const { colorMode } = useColorMode();
    React.useEffect(() => {
        if (excalidrawAPI && excalidoc && !initialized.current) {
            excalidrawAPI.scrollToContent();
            renderedSceneVersion.current = Lib.getSceneVersion(excalidoc.elements);
            apiSceneVersion.current = renderedSceneVersion.current;
            const onChangeDisposer = excalidrawAPI.onChange((elements, appState, files) => {
                const version = Lib.getSceneVersion(elements);
                if (version === renderedSceneVersion.current) {
                    return;
                }
                renderedSceneVersion.current = version;
                const nonDeletedElements = Lib.getNonDeletedElements(elements);
                apiSceneVersion.current = Lib.getSceneVersion(nonDeletedElements);
                const restoredData = Lib.restore({ elements: elements, files: files }, {}, []);
                excalidoc.setData(
                    {
                        image: '',
                        files: restoredData.files,
                        elements: nonDeletedElements
                    },
                    Source.LOCAL,
                    new Date(),
                    Lib
                );
            });
            const rDisposer = reaction(
                () => excalidoc.data.elements,
                (elements) => {
                    const newVersion = Lib.getSceneVersion(elements);
                    if (newVersion === apiSceneVersion.current) {
                        return;
                    }
                    console.log('rScene changed', newVersion);
                    const restoredData = Lib.restore(
                        { elements: elements, files: excalidoc.data.files },
                        {},
                        []
                    );
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    excalidrawAPI.updateScene(restoredData);
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    renderedSceneVersion.current = newVersion;
                    apiSceneVersion.current = newVersion;
                }
            );
            initialized.current = true;
            return () => {
                initialized.current = false;
                onChangeDisposer();
                rDisposer();
            };
        }
    }, [excalidrawAPI, excalidoc]);
    if (!excalidoc || !Lib) {
        return null;
    }
    return (
        <Lib.Excalidraw
            initialData={{
                elements: excalidoc.elements,
                files: excalidoc.files,
                appState: {
                    objectsSnapModeEnabled: true,
                    zenModeEnabled: true
                }
            }}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            objectsSnapModeEnabled
            langCode="de-DE"
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            UIOptions={{ canvasActions: { toggleTheme: false } }}
        >
            <Lib.MainMenu>
                <Lib.MainMenu.DefaultItems.Export />
                <Lib.MainMenu.DefaultItems.SaveAsImage />
                <Lib.MainMenu.DefaultItems.ChangeCanvasBackground />
                <Lib.MainMenu.DefaultItems.ClearCanvas />
                <Lib.MainMenu.DefaultItems.Help />
            </Lib.MainMenu>
        </Lib.Excalidraw>
    );
});

export default Editor;
