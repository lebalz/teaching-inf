import React from 'react';
import { observer } from 'mobx-react-lite';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import Loader from '@tdev-components/Loader';
import { useExcalidraw } from '@tdev-hooks/useExcalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { Source } from '@tdev-models/iDocument';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import { reaction } from 'mobx';
import { getSceneVersion, restore } from '@excalidraw/excalidraw';
import _ from 'lodash';

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const initialized = React.useRef<boolean>(false);
    const renderedSceneVersion = React.useRef(0);
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI>();
    const Excalidraw = useExcalidraw();
    const doc = useFirstRealMainDocument(props.id, meta);

    React.useEffect(() => {
        if (excalidrawAPI && doc && !initialized.current) {
            console.log('Excalidraw API initialized');
            const restoredData = restore(doc.data, {}, []);

            excalidrawAPI.updateScene(restoredData);
            excalidrawAPI.addFiles(Object.values(restoredData.files));
            renderedSceneVersion.current = doc.sceneVersion;

            const unsubscribe = excalidrawAPI.onChange((elements, appState, files) => {
                const version = getSceneVersion(elements);
                if (version === doc.sceneVersion) {
                    return;
                }
                renderedSceneVersion.current = version;
                const restoredData = restore({ elements: elements, files: files }, {}, []);
                doc.setData(
                    {
                        files: restoredData.files,
                        elements: restoredData.elements
                    },
                    Source.LOCAL
                );
            });
            const rDisposer = reaction(
                () => doc.data,
                (data) => {
                    if (doc.localSceneVersion === renderedSceneVersion.current) {
                        return;
                    }
                    const restoredData = restore(data, {}, []);
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    excalidrawAPI.updateScene(restoredData);
                    excalidrawAPI.addFiles(Object.values(restoredData.files));
                    renderedSceneVersion.current = doc.localSceneVersion;
                }
            );
            initialized.current = true;
            return () => {
                unsubscribe();
                rDisposer();
            };
        }
    }, [excalidrawAPI, doc]);

    if (!doc || !Excalidraw) {
        return <Loader />;
    }
    return (
        <div style={{ height: '600px', width: '100%' }}>
            <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
        </div>
    );
});

export default Excalidoc;
