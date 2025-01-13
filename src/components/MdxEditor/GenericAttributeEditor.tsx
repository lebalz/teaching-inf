import React from 'react';
import { observer } from 'mobx-react-lite';
import _ from 'lodash';
import File from '@tdev-models/github/File';
import {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxExpressionAttribute,
    MdxJsxFlowElement,
    MdxJsxTextElement
} from 'mdast-util-mdx-jsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Loader from '@tdev-components/Loader';
import { JsxComponentDescriptor, MdastJsx, PropertyPopover, useMdastNodeUpdater } from '@mdxeditor/editor';

export interface Props {
    descriptor: JsxComponentDescriptor;
    mdastNode: MdastJsx;
}

// @see https://github.com/mdx-editor/editor/blob/d484a0b7c06912527c03d3a2e8d56a69e70fef27/src/jsx-editors/GenericJsxEditor.tsx

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

const GenericAttributeEditor = (props: Props) => {
    const { descriptor, mdastNode } = props;
    const updateMdastNode = useMdastNodeUpdater();
    const properties = React.useMemo(
        () =>
            descriptor.props.reduce<Record<string, string>>((acc, { name }) => {
                const attribute = mdastNode.attributes.find((attr) =>
                    isMdxJsxAttribute(attr) ? attr.name === name : false
                );

                if (attribute) {
                    if (isExpressionValue(attribute.value)) {
                        acc[name] = attribute.value.value;
                        return acc;
                    }

                    if (isStringValue(attribute.value)) {
                        acc[name] = attribute.value;
                        return acc;
                    }
                }

                acc[name] = '';
                return acc;
            }, {}),
        [mdastNode, descriptor]
    );

    const onChange = React.useCallback(
        (values: Record<string, string>) => {
            const updatedAttributes = Object.entries(values).reduce<typeof mdastNode.attributes>(
                (acc, [name, value]) => {
                    if (value === '') {
                        return acc;
                    }

                    const property = descriptor.props.find((prop) => prop.name === name);

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

            updateMdastNode({ attributes: updatedAttributes });
        },
        [mdastNode, updateMdastNode, descriptor]
    );
    if (descriptor.props.length === 0) {
        return null;
    }
    return <PropertyPopover properties={properties} title={mdastNode.name ?? ''} onChange={onChange} />;
};

export default GenericAttributeEditor;
