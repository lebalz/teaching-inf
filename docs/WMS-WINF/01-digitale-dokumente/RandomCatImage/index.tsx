import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Figure from '@tdev-components/Figure';
import SourceRef from '@tdev-components/Figure/SourceRef';


const RandomCatImage = observer(() => {
    const userStore = useStore('userStore');
    const url = React.useMemo(() => {
        if (!userStore.current) {
            return 'https://cataas.com/cat/says/inf.gbsl.website?fontSize=80&fontColor=red';
        }
        return `https://cataas.com/cat/says/${userStore.current.name}?fontSize=80&fontColor=red`;
    }, [userStore.current]);
    return <Figure>
            <img style={{maxWidth: 'min(90vw, 100%)', width: '250px'}} src={url} />
            <span className="caption inline">
                <SourceRef bib={{ author: 'Kevin', source: url, licence: 'Public Domain'  }} className='inline' />
            </span>
        </Figure>
});

export default RandomCatImage;