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
} from '@tdev-components/Cms/MdxEditor/PropertyEditor/hooks/useDirectiveAttributeEditor';
import PropertyEditor from '@tdev-components/Cms/MdxEditor/PropertyEditor';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';

const props: DirectiveProperty[] = [
    {
        name: 'autoplay',
        type: 'checkbox',
        description: 'Automatisch abspielen',
        required: false
    },
    {
        name: 'muted',
        type: 'checkbox',
        description: 'Ohne Ton',
        required: false
    },
    {
        name: 'loop',
        type: 'checkbox',
        description: 'Endlosschleife',
        required: false
    },
    {
        name: 'controls',
        type: 'checkbox',
        description: 'Steuerung anzeigen',
        required: false
    }
];
/**
 * Pass this descriptor to the `directivesPlugin` `directiveDescriptors` parameter to enable {@link https://docusaurus.io/docs/markdown-features/admonitions | markdown admonitions}.
 *
 * @example
 * ```tsx
 * <MDXEditor
 *  plugins={[
 *   directivesPlugin({ directiveDescriptors: [ AdmonitionDirectiveDescriptor] }),
 *  ]} />
 * ```
 * @group Directive
 */
export const VideoDescriptor: DirectiveDescriptor = {
    name: 'video',
    attributes: [],
    hasChildren: true,
    testNode(node) {
        return node.name === 'video' && node.type === 'leafDirective';
    },
    Editor: observer(({ mdastNode }) => {
        const { jsxAttributes, directiveAttributes, onUpdate } = useDirectiveAttributeEditor(
            props,
            mdastNode.attributes
        );
        const cmsStore = useStore('cmsStore');
        const { editedFile } = cmsStore;
        const firstChild = mdastNode.children[0];
        const src =
            firstChild.type === 'text' ? firstChild.value : firstChild.type === 'link' ? firstChild.url : '';
        const gitVideo = editedFile?.findEntryByRelativePath(src);
        const ref = React.useRef<PopupActions>(null);
        return (
            <Popup
                trigger={
                    <div className={clsx(styles.media)}>
                        <video
                            className={clsx(styles.video)}
                            style={{ maxWidth: '100%', ...jsxAttributes.style }}
                            {...jsxAttributes.attributes}
                        >
                            <source src={gitVideo?.type === 'bin_file' ? gitVideo.src : src} />
                        </video>
                    </div>
                }
                keepTooltipInside="#__docusaurus"
                overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
                ref={ref}
                modal
                on="click"
            >
                <PropertyEditor
                    values={{ ...directiveAttributes, className: directiveAttributes.class }}
                    onUpdate={onUpdate}
                    properties={props}
                    onClose={() => ref.current?.close()}
                />
            </Popup>
        );
    })
};
