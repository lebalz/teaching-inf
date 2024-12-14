import React from 'react';
import type { default as QrScannerLib } from '@yudiel/react-qr-scanner';

export const useQrScanner = (): typeof QrScannerLib | null => {
    const [Excalidraw, setExcalidraw] = React.useState<typeof QrScannerLib | null>(null);
    React.useEffect(() => {
        import('@yudiel/react-qr-scanner').then((qrScanner) => {
            setExcalidraw(qrScanner);
        });
    }, []);
    return Excalidraw;
};
