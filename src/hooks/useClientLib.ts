import React from 'react';

let cachedLib: any = null;
export const useClientLib = <T>(dynImport: () => Promise<T>): T | null => {
    const [Lib, setLib] = React.useState<T>(cachedLib);
    React.useEffect(() => {
        if (Lib) {
            setLib(Lib);
            return;
        }
        dynImport().then((Lib) => {
            setLib(Lib);
            cachedLib = Lib;
        });
    }, []);
    return Lib;
};
