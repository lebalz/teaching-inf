import React from 'react';
import _ from 'lodash';
import {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxExpressionAttribute
} from 'mdast-util-mdx-jsx';
import { JsxPropertyDescriptor, useMdastNodeUpdater } from '@mdxeditor/editor';
import type { RootContent } from 'mdast';

/* @see https://github.com/mdx-editor/editor/blob/main/src/plugins/core/PropertyPopover.tsx */
import Editor from './Editor';
import { GenericPropery } from '../GenericAttributeEditor';

// @see https://github.com/mdx-editor/editor/blob/main/src/jsx-editors/GenericJsxEditor.tsx

const isExpressionValue = (
    value: string | MdxJsxAttributeValueExpression | null | undefined
): value is MdxJsxAttributeValueExpression => {
    if (
        value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        'value' in value &&
        typeof value.value === 'string'
    ) {
        return true;
    }

    return false;
};

const isStringValue = (value: string | MdxJsxAttributeValueExpression | null | undefined): value is string =>
    typeof value === 'string';

const isMdxJsxAttribute = (value: MdxJsxAttribute | MdxJsxExpressionAttribute): value is MdxJsxAttribute => {
    if (value.type === 'mdxJsxAttribute' && typeof value.name === 'string') {
        return true;
    }

    return false;
};

export interface Property {
    name: string;
    type: React.HTMLInputTypeAttribute;
    value?: string;
    required?: boolean;
    description?: string;
    placeholder?: string | number;
}

export interface Props {
    properties: JsxPropertyDescriptor[];
    mdastAttributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
    updateMdastNode: (node: Partial<RootContent>) => void;
    onClose?: () => void;
}

const PropertyEditor = (props: Props) => {
    const { properties, mdastAttributes } = props;
    const cProps = React.useMemo(
        () =>
            properties.map<GenericPropery>((prop) => {
                const attribute = mdastAttributes.find((attr) =>
                    isMdxJsxAttribute(attr) ? attr.name === prop.name : false
                );

                if (attribute) {
                    if (isExpressionValue(attribute.value)) {
                        return { ...prop, value: attribute.value.value };
                    }

                    if (isStringValue(attribute.value)) {
                        return { ...prop, value: attribute.value };
                    }
                }

                return { ...prop, value: '' };
            }),
        [mdastAttributes, properties]
    );

    const onChange = React.useCallback(
        (values: Record<string, string>) => {
            const updatedAttributes = Object.entries(values).reduce<typeof mdastAttributes>(
                (acc, [name, value]) => {
                    if (value === '') {
                        return acc;
                    }

                    const property = properties.find((prop) => prop.name === name);

                    if (property?.type === 'expression') {
                        acc.push({
                            type: 'mdxJsxAttribute',
                            name,
                            value: { type: 'mdxJsxAttributeValueExpression', value }
                        });
                        return acc;
                    }

                    acc.push({
                        type: 'mdxJsxAttribute',
                        name,
                        value
                    });

                    return acc;
                },
                []
            );

            props.updateMdastNode({ attributes: updatedAttributes });
        },
        [mdastAttributes, props.updateMdastNode, properties]
    );
    if (properties.length === 0) {
        return null;
    }
    return <Editor onChange={onChange} properties={cProps} onClose={props.onClose} />;
};

export default PropertyEditor;
