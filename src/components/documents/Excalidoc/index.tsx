import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks//useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { type Excalidraw as ExcalidrawComponent } from '@excalidraw/excalidraw';

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const [Excalidraw, setExcalidraw] = React.useState<typeof ExcalidrawComponent | null>(null);
    const doc = useFirstMainDocument(props.id, meta);
    React.useEffect(() => {
        import('@excalidraw/excalidraw').then((excalidraw) => {
            setExcalidraw(excalidraw.Excalidraw);
        });
    }, []);
    if (!doc) {
        return <Loader />;
    }
    return (
        <BrowserOnly fallback={<Loader />}>
            {() => {
                if (!Excalidraw) {
                    return <Loader />;
                }
                return (
                    <div style={{ height: '600px', width: '100%' }}>
                        <Excalidraw />
                    </div>
                )
            }}
        </BrowserOnly>
    );
});

export default Excalidoc;
