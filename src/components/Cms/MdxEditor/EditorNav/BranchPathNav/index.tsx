import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import iEntry from '@tdev-models/cms/iEntry';
import BranchSelector from './BranchSelector';
import NavMenu from '@tdev-components/Cms/Github/iFile/Dir/NavMenu';
import NavFile from '@tdev-components/Cms/Github/iFile/File/NavFile';

interface Props {
    item: iEntry;
}

const BranchPathNav = observer((props: Props) => {
    const { item } = props;
    const [closeDropdown, setCloseDropdown] = React.useState(false);
    React.useEffect(() => {
        if (closeDropdown) {
            setCloseDropdown(false);
        }
    }, [closeDropdown]);
    return (
        <div className={clsx(styles.pathNav)}>
            <nav aria-label="breadcrumbs" className={clsx(styles.breadcrumbs)}>
                <div className={clsx(styles.part)}>
                    <BranchSelector compact />
                </div>
                {item.tree.map((part, idx) => {
                    if (!part) {
                        return null;
                    }
                    if (part.type === 'dir') {
                        return (
                            <div className={clsx(styles.part)} key={idx}>
                                <NavMenu dir={part} partOf="nav" />
                            </div>
                        );
                    }
                    return (
                        <div className={clsx(styles.part)} key={idx}>
                            <NavFile file={part} isActive className={clsx(styles.part)} />
                        </div>
                    );
                })}
            </nav>
        </div>
    );
});

export default BranchPathNav;
