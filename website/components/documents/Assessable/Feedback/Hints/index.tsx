import React from 'react';
import { observer } from 'mobx-react-lite';
import { useDocument } from '@tdev-hooks/useContextDocument';
import { AssessableType } from '@tdev-api/document';
import { Correctness } from '@tdev-models/documents/Assessable/iAssessable';
import Alert from '@tdev-components/shared/Alert';

interface Props {
    children?: React.ReactNode;
    // value of enum Correctness or 'always' to always show the hint
    when: Correctness | 'always';
}
type BadgeType = 'secondary' | 'success' | 'info' | 'warning' | 'danger';
const ColorMapping: { [key in Correctness | 'always']: BadgeType } = {
    [Correctness.Correct]: 'success',
    [Correctness.Incorrect]: 'danger',
    [Correctness.PartiallyCorrect]: 'warning',
    [Correctness.NA]: 'secondary',
    always: 'info'
};

const Hints = observer(<T extends AssessableType>(props: Props) => {
    const doc = useDocument<T>();
    if (!doc.isAssessed) {
        return null;
    }
    if (props.when !== 'always' && doc.assessment?.correctness !== props.when) {
        return null;
    }

    return <Alert type={ColorMapping[props.when]}>{props.children}</Alert>;
});

export default Hints;
