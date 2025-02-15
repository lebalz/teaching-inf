import React from 'react';
import _ from 'lodash';
import { JsxComponentDescriptor, MdastJsx } from '@mdxeditor/editor';
import PropertyEditor from './PropertyEditor';
import Popup from 'reactjs-popup';
import { mdiCog } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { PopupActions } from 'reactjs-popup/dist/types';

export interface Props {
    descriptor: JsxComponentDescriptor;
    mdastNode: MdastJsx;
}

const GenericAttributeEditor = (props: Props) => {
    const { descriptor, mdastNode } = props;
    const ref = React.useRef<PopupActions>(null);
    return (
        <Popup
            trigger={
                <span>
                    <Button icon={mdiCog} size={0.8} />
                </span>
            }
            keepTooltipInside="#__docusaurus"
            overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
            ref={ref}
            modal
            on="click"
        >
            <PropertyEditor
                properties={descriptor.props}
                title={mdastNode.name ?? ''}
                mdastAttributes={mdastNode.attributes}
                onClose={() => ref.current?.close()}
            />
        </Popup>
    );
};

export default GenericAttributeEditor;
