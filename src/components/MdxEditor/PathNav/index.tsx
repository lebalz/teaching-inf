import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import iEntry from '@tdev-models/cms/iEntry';

interface Props {
    item: iEntry;
}

const PathNav = observer((props: Props) => {
    // const cmsStore = useStore('cmsStore');
    const { item } = props;
    return (
        <div className={clsx(styles.PathNav)}>
            <nav aria-label="breadcrumbs">
                <ul className={clsx('breadcrumbs', 'breadcrumbs--sm')}>
                    {item.tree.map((part, index) => {
                        if (!part) {
                            return null;
                        }
                        return (
                            <li className={clsx('breadcrumbs__item')} key={index}>
                                {part.children.length > 0 ? (
                                    <div className={clsx('dropdown dropdown--hoverable')}>
                                        <button
                                            className={clsx(
                                                'button',
                                                'button--secondary',
                                                'button--sm',
                                                'breadcrumbs__link'
                                            )}
                                        >
                                            {part.name}
                                        </button>
                                        <ul className={clsx('dropdown__menu')}>
                                            {part.children.map((child, idx) => {
                                                return (
                                                    <li>
                                                        <a className={clsx('dropdown__link')} href="#url">
                                                            {child.name}
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ) : (
                                    <a
                                        className={clsx('breadcrumbs__link')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('clicked', part);
                                        }}
                                        href="#"
                                    >
                                        {part.name}
                                    </a>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
});

export default PathNav;
