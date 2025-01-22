import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Card from '@tdev-components/shared/Card';
import TextInput from '@tdev-components/shared/TextInput';
import Button from '@tdev-components/shared/Button';

interface Props {}

const AddFile = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const [name, setName] = React.useState('');

    return (
        <Card
            classNames={{ card: clsx(styles.addFile) }}
            header={<h4>Datei Hinzufügen</h4>}
            footer={<Button text="Datei erstellen" />}
        >
            <TextInput onChange={setName} value={name} />
        </Card>
    );
});

export default AddFile;
