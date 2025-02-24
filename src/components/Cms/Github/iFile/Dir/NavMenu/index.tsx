import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Dir from '@tdev-models/cms/Dir';
import Popup from 'reactjs-popup';
import { PopupActions } from 'reactjs-popup/dist/types';
import Card from '@tdev-components/shared/Card';
import Badge from '@tdev-components/shared/Badge';
import Loader from '@tdev-components/Loader';
import NavFile from '../../File/NavFile';
import NavItem from '@tdev-components/Cms/MdxEditor/EditorNav/BranchPathNav/NavItem';

interface Props {
    dir: Dir;
    partOf: 'nav' | 'menu';
    isActive?: boolean;
    className?: string;
}

const NavMenu = observer((props: Props) => {
    const { dir, partOf } = props;
    const cmsStore = useStore('cmsStore');
    const activeFilePath = cmsStore.activeFilePath || '';
    const ref = React.useRef<PopupActions>(null);

    return (
        <Popup
            ref={ref}
            on="hover"
            arrow={false}
            trigger={
                <div>
                    <NavItem
                        onClick={() => {
                            cmsStore.setActiveEntry(dir);
                        }}
                        icon={partOf === 'menu' ? dir.icon : undefined}
                        color={dir.iconColor}
                        name={dir.name}
                        isActive={props.isActive}
                        className={clsx(props.className)}
                    />
                </div>
            }
            onOpen={() => {
                dir.fetchDirectory();
            }}
            position={partOf === 'menu' ? 'right top' : undefined}
            offsetY={partOf === 'menu' ? -15 : 0}
            offsetX={partOf === 'menu' ? 5 : 0}
            nested
        >
            <Card classNames={{ body: styles.menu, card: styles.menuCard }}>
                {!dir.isLoaded && <Loader />}
                {dir.children.map((c, idx) => {
                    if (c.type === 'dir') {
                        return (
                            <NavMenu
                                dir={c}
                                key={idx}
                                partOf="menu"
                                isActive={activeFilePath.startsWith(c.path)}
                            />
                        );
                    }
                    return <NavFile file={c} key={idx} isActive={activeFilePath === c.path} />;
                })}
            </Card>
        </Popup>
    );
});

export default NavMenu;
