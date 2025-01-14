/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import Icon from '@mdi/react';
import Card from '@tdev-components/shared/Card';
import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';
import _ from 'lodash';
import * as Mdi from '@mdi/js';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { $createDirectiveNode } from '@mdxeditor/editor';

class MdiOption extends MenuOption {
    name: string;
    mdiIcon: keyof typeof Mdi;

    constructor(mdiIcon: keyof typeof Mdi) {
        super(mdiIcon);
        this.mdiIcon = mdiIcon;
        this.name = _.startCase(mdiIcon).split(' ').slice(1).join(' ');
    }
}

interface MdiMenuProps {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: MdiOption;
}
function EmojiMenuItem(props: MdiMenuProps) {
    const { index, isSelected, onClick, onMouseEnter, option } = props;
    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={clsx('item', isSelected && 'selected', styles.mdiItem)}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={'typeahead-item-' + index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <Icon path={Mdi[option.mdiIcon]} size={0.8} className={clsx(styles.icon)} />
            <span className={clsx('text')}>{option.name}</span>
        </li>
    );
}

const MAX_MDI_SUGGESTION_COUNT = 30;

export default function MdiPickerPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);
    const [mdiIcons, setMdiIcons] = useState<Array<keyof typeof Mdi>>([]);

    React.useLayoutEffect(() => {
        setMdiIcons(Object.keys(Mdi) as (keyof typeof Mdi)[]);
    }, []);

    const emojiOptions = useMemo(
        () => (mdiIcons != null ? mdiIcons.map((ico) => new MdiOption(ico)) : []),
        [mdiIcons]
    );

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', {
        minLength: 0
    });

    const options: Array<MdiOption> = useMemo(() => {
        if (!queryString) {
            return emojiOptions.slice(0, MAX_MDI_SUGGESTION_COUNT);
        }
        const tokens = _.startCase(queryString).split(' ');
        const regex = new RegExp(tokens.map((q) => `(?=.*${q})`).join(''), 'i');
        const startRegex = new RegExp(`^(${tokens.join('|')})`, 'i');
        return emojiOptions
            .filter((option: MdiOption) => regex.test(option.name))
            .sort((a, b) => (startRegex.test(a.name) ? (startRegex.test(b.name) ? 0 : -1) : 1))
            .slice(0, MAX_MDI_SUGGESTION_COUNT);
    }, [emojiOptions, queryString]);

    const onSelectOption = useCallback(
        (selectedOption: MdiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
            editor.update(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection) || selectedOption == null) {
                    return;
                }

                if (nodeToRemove) {
                    nodeToRemove.remove();
                }

                selection.insertNodes([
                    $createDirectiveNode({
                        name: 'mdi',
                        type: 'textDirective',
                        children: [{ type: 'text', value: selectedOption.name.toLowerCase() }]
                    })
                ]);

                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={options}
            menuRenderFn={(
                anchorElementRef,
                { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
            ) => {
                if (anchorElementRef.current == null || options.length === 0) {
                    return null;
                }

                return anchorElementRef.current && options.length
                    ? ReactDOM.createPortal(
                          <Card classNames={{ card: clsx(styles.card) }}>
                              <ul className={clsx(styles.mdiList)}>
                                  {options.map((option: MdiOption, index) => (
                                      <EmojiMenuItem
                                          key={option.key}
                                          index={index}
                                          isSelected={selectedIndex === index}
                                          onClick={() => {
                                              setHighlightedIndex(index);
                                              selectOptionAndCleanUp(option);
                                          }}
                                          onMouseEnter={() => {
                                              setHighlightedIndex(index);
                                          }}
                                          option={option}
                                      />
                                  ))}
                              </ul>
                          </Card>,
                          anchorElementRef.current
                      )
                    : null;
            }}
        />
    );
}
