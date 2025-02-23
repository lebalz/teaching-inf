/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { DirectiveDescriptor } from '@mdxeditor/editor';
import styles from './styles.module.scss';
import clsx from 'clsx';
import * as MdiIcons from '@mdi/js';
import Popup from 'reactjs-popup';
import Icon from '@mdi/react';
import { PopupActions } from 'reactjs-popup/dist/types';
import {
    DirectiveProperty,
    useDirectiveAttributeEditor
} from '@tdev-components/Cms/MdxEditor/hooks/useDirectiveAttributeEditor';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Card from '@tdev-components/shared/Card';
import GenericAttributeEditor from '@tdev-components/Cms/MdxEditor/GenericAttributeEditor';
import RemoveNode from '@tdev-components/Cms/MdxEditor/RemoveNode';
import { useAssetFile } from '@tdev-components/Cms/MdxEditor/hooks/useAssetFile';

const props: DirectiveProperty[] = [];
export const AudioDescriptor: DirectiveDescriptor = {
    name: 'audio',
    attributes: [],
    hasChildren: true,
    testNode(node) {
        return node.name === 'audio' && node.type === 'leafDirective';
    },
    Editor: observer(({ mdastNode }) => {
        const { jsxAttributes, directiveAttributes, onUpdate } = useDirectiveAttributeEditor(
            props,
            mdastNode.attributes
        );
        const src = React.useMemo(() => {
            const firstChild = mdastNode.children[0];
            return firstChild.type === 'text'
                ? firstChild.value
                : firstChild.type === 'link'
                  ? firstChild.url
                  : '';
        }, [mdastNode]);
        const gitAudio = useAssetFile(src);

        return (
            <Card>
                <div className={clsx(styles.actions)}>
                    <GenericAttributeEditor
                        values={{ ...directiveAttributes, className: directiveAttributes.class }}
                        onUpdate={onUpdate}
                        properties={props}
                        canExtend
                    />
                    {src}
                    <RemoveNode />
                </div>
                <div className={clsx(styles.media)}>
                    <audio
                        key={gitAudio?.sha}
                        className={clsx(styles.video)}
                        style={{ maxWidth: '100%', ...jsxAttributes.style }}
                        controls
                        {...jsxAttributes.jsxAttributes}
                    >
                        <source src={gitAudio?.type === 'bin_file' ? gitAudio.src : src} />
                    </audio>
                </div>
            </Card>
        );
    })
};
