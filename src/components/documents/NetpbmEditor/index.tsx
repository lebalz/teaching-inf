import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';

interface Props {
    default?: string;
    noEditor?: boolean;
    readonly?: boolean;
}

const NetpbmEditor = observer((props: Props) => {
    return (
        <div>
            <code>{JSON.stringify(props)}</code>
        </div>
    );
});

export default NetpbmEditor;