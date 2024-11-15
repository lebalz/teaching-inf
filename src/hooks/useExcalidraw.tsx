import React from 'react';
import { type Excalidraw as ExcalidrawComponent } from '@excalidraw/excalidraw';

export const useExcalidraw = (): typeof ExcalidrawComponent | null => {
    const [Excalidraw, setExcalidraw] = React.useState<typeof ExcalidrawComponent | null>(null);
    React.useEffect(() => {
        import('@excalidraw/excalidraw').then((excalidraw) => {
            setExcalidraw(excalidraw.Excalidraw);
        });
    }, []);
    return Excalidraw;
};
