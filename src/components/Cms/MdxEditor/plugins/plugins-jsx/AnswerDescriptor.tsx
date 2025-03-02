import { JsxComponentDescriptor, JsxPropertyDescriptor } from '@mdxeditor/editor';
import RemoveNode from '../../RemoveNode';
import styles from './styles.module.scss';
import clsx from 'clsx';
import {
    mdiCardTextOutline,
    mdiCheckboxOutline,
    mdiFormatListCheckbox,
    mdiFormTextbox,
    mdiInvoiceTextSendOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import GenericAttributeEditor, { GenericPropery } from '../../GenericAttributeEditor';
import Card from '@tdev-components/shared/Card';
import { DocumentType } from '@tdev-api/document';
import type { MdxJsxAttribute } from 'mdast-util-mdx';
import { useAttributeEditorInNestedEditor } from '../../hooks/useAttributeEditorInNestedEditor';
import { parseExpression } from '../../PropertyEditor/parseValue';
import Answer from '@tdev-components/Answer';
import { v4 as uuidv4 } from 'uuid';

const props: GenericPropery[] = [
    { name: 'id', type: 'text', required: true, placeholder: 'id', generateNewValue: () => uuidv4() },
    { name: 'type', type: 'select', required: true, options: ['text', DocumentType.String, 'state'] }
];

const IconMap: { [key: string]: string } = {
    [DocumentType.String]: mdiFormTextbox,
    [DocumentType.QuillV2]: mdiCardTextOutline,
    text: mdiCardTextOutline,
    state: mdiCheckboxOutline,
    [DocumentType.TaskState]: mdiCheckboxOutline,
    default: mdiInvoiceTextSendOutline
};

const AnswerDescriptor: JsxComponentDescriptor = {
    name: 'Answer',
    source: undefined,
    kind: 'flow',
    hasChildren: false,
    props: props as JsxPropertyDescriptor[],
    Editor: ({ descriptor, mdastNode }) => {
        const answerType = mdastNode.attributes.find(
            (attr) =>
                attr.type === 'mdxJsxAttribute' && attr.name === 'type' && typeof attr.value === 'string'
        )?.value as 'text' | DocumentType | 'state';
        const { onUpdate, values } = useAttributeEditorInNestedEditor(props, mdastNode.attributes);

        return (
            <Card classNames={{ body: clsx(styles.answerCard) }}>
                <div className={clsx(styles.answer)}>
                    <Answer type={answerType} hideWarning hideApiState readonly id={values.id} />
                </div>
                <GenericAttributeEditor
                    properties={descriptor.props}
                    onUpdate={onUpdate}
                    values={values}
                    canExtend
                />
                <RemoveNode />
            </Card>
        );
    }
};
export default AnswerDescriptor;
