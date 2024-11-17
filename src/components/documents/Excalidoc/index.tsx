import React from 'react';
import { observer } from 'mobx-react-lite';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import Loader from '@tdev-components/Loader';
import { useExcalidraw } from '@tdev-hooks/useExcalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { Source } from '@tdev-models/iDocument';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import { reaction } from 'mobx';
import { useColorMode } from '@docusaurus/theme-common';
import _ from 'lodash';

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const initialized = React.useRef<boolean>(false);
    const renderedSceneVersion = React.useRef(0);
    const apiSceneVersion = React.useRef(0);
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI>();
    const Lib = useExcalidraw();
    const doc = useFirstRealMainDocument(props.id, meta);
    const { colorMode } = useColorMode();

    React.useEffect(() => {
        if (excalidrawAPI && doc && !initialized.current) {
            console.log('Excalidraw API initialized');
            const restoredData = Lib!.restore(doc.data, {
                objectsSnapModeEnabled: true,
                zenModeEnabled: true,
            }, []);

            excalidrawAPI.updateScene(restoredData);
            excalidrawAPI.addFiles(Object.values(restoredData.files));
            renderedSceneVersion.current = Lib!.getSceneVersion(restoredData.elements);
            apiSceneVersion.current = renderedSceneVersion.current;

            const unsubscribe = excalidrawAPI.onChange((elements, appState, files) => {
                const version = Lib!.getSceneVersion(elements);
                if (version === renderedSceneVersion.current) {
                    return;
                }
                renderedSceneVersion.current = version;
                const nonDeletedElements = Lib!.getNonDeletedElements(elements);
                apiSceneVersion.current = Lib!.getSceneVersion(nonDeletedElements);
                const restoredData = Lib!.restore({ elements: elements, files: files }, {}, []);
                doc.setData(
                    {
                        files: restoredData.files,
                        elements: nonDeletedElements
                    },
                    Source.LOCAL
                );
            });
            const rDisposer = reaction(
                () => doc.data,
                (data) => {
                    const newVersion = Lib!.getSceneVersion(data.elements);
                    if (newVersion === apiSceneVersion.current) {
                        return;
                    }
                    const restoredData = Lib!.restore(data, {}, []);
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    excalidrawAPI.updateScene(restoredData);
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    renderedSceneVersion.current = newVersion;
                    apiSceneVersion.current = newVersion;
                }
            );
            initialized.current = true;
            return () => {
                unsubscribe();
                rDisposer();
            };
        }
    }, [excalidrawAPI, doc]);

    if (!doc || !Lib) {
        return <Loader />;
    }
    return (
        <div style={{ height: '600px', width: '100%' }}>
            <Lib.Excalidraw
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
        </div>
    );
});

export default Excalidoc;
