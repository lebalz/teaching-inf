import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';


const RandomCatImage = observer(() => {
    const userStore = useStore('userStore');
    if (!userStore.current) {
        return <img style={{maxWidth: 'min(90vw, 100%)', width: '250px'}} src='https://cataas.com/cat/says/inf.gbsl.website?fontSize=80&fontColor=red' />
    }
    return <img style={{maxWidth: 'min(90vw, 100%)', width: '250px'}} src={`https://cataas.com/cat/says/${userStore.current.name}?fontSize=80&fontColor=red`} />
});

export default RandomCatImage;