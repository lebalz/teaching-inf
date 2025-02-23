import React from 'react';
import _ from 'lodash';
import { Directives } from 'mdast-util-directive';
import { useMdastNodeUpdater } from '@mdxeditor/editor';

import type { GenericPropery, GenericValueProperty } from '../../GenericAttributeEditor';
import { Options, transformAttributes } from '@tdev-plugins/helpers';

export type DirectiveProperty = Omit<GenericPropery, 'type'> & { type: React.HTMLInputTypeAttribute };
type DirectiveValueProperty = Omit<GenericValueProperty, 'type'> & { type: React.HTMLInputTypeAttribute };

export const useDirectiveAttributeEditor = (
    properties: DirectiveProperty[],
    mdastAttributes: Directives['attributes'],
    jsxAttrTransformer?: (raw: Options) => Options
) => {
    const updateMdastNode = useMdastNodeUpdater();
    const { jsxAttributes: attributes, directiveAttributes } = React.useMemo(() => {
        const rawAttributes = transformAttributes(mdastAttributes || {});
        const jsxAttributes = jsxAttrTransformer ? jsxAttrTransformer(rawAttributes) : rawAttributes;
        const directiveAttrs = {
            class: rawAttributes.className,
            ...rawAttributes.style,
            ...rawAttributes.attributes
        };
        delete (directiveAttrs as any).className;
        if (!directiveAttrs.class) {
            delete (directiveAttrs as any).class;
        }

        return { jsxAttributes: jsxAttributes, directiveAttributes: directiveAttrs };
    }, [mdastAttributes, properties, jsxAttrTransformer]);

    const onUpdate = React.useCallback(
        (values: DirectiveValueProperty[]) => {
            const updatedAttributes = values.reduce<typeof mdastAttributes>((acc, prop) => {
                if (!acc) {
                    return acc;
                }
                if (prop.value === '' || !prop.value) {
                    return acc;
                }
                // for directives, the attribute "className" is called "class"
                // --> like that, tha values will be correctly transformed to ".name"
                if (prop.name === 'className') {
                    acc.class = prop.value;
                } else {
                    if (prop.value === 'true') {
                        prop.value = '';
                    } else if (prop.value === 'false') {
                        return acc;
                    }
                    acc[prop.name] = prop.value;
                }
                return acc;
            }, {});

            updateMdastNode({ attributes: updatedAttributes });
        },
        [mdastAttributes, updateMdastNode, properties]
    );

    return { jsxAttributes: attributes, directiveAttributes: directiveAttributes, onUpdate: onUpdate };
};
