import React from 'react';
import Layout from '@theme/Layout';
import siteConfig from '@generated/docusaurus.config';
import styles from './styles.module.scss';
import { areIdenticalLines3D } from './helper';
import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiCircleSmall, mdiPlus } from '@mdi/js';
const { NO_AUTH } = siteConfig.customFields as { NO_AUTH?: boolean };

interface VectorInputProps {
    value: [string, string, string];
    onChange: (value: [string, string, string]) => void;
}

const FloatRegex = /^-?\d+(\.\d+)?$/;
const FracRegex = /^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/;

const parseNumber = (numText: string) => {
    if (FracRegex.test(numText)) {
        const [numerator, denominator] = numText.split('/').map(Number);
        return numerator / denominator;
    } else if (FloatRegex.test(numText)) {
        return parseFloat(numText);
    }
    return NaN;
};

const VectorInput = ({ value, onChange }: VectorInputProps) => {
    const handleChange = (index: number, newValue: string) => {
        const newVector = [...value] as [string, string, string];
        newVector[index] = newValue;
        onChange(newVector);
    };

    return (
        <>
            <div className={clsx(styles.vector)}>
                <div className={clsx(styles.content)}>
                    {value.map((component, index) => (
                        <input
                            key={index}
                            type="text"
                            value={component}
                            onChange={(e) => handleChange(index, e.target.value)}
                            style={{ width: '50px', margin: '0 5px' }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

const CompareVectorLines = () => {
    const [vecS1, setVecS1] = React.useState<[string, string, string]>(['0', '0', '0']);
    const [vecR1, setVecR1] = React.useState<[string, string, string]>(['1', '0', '0']);
    const [vecS2, setVecS2] = React.useState<[string, string, string]>(['0', '0', '0']);
    const [vecR2, setVecR2] = React.useState<[string, string, string]>(['1', '0', '0']);

    const [isInvalid, setIsInvalid] = React.useState<boolean>(false);
    const [areIdentical, setAreIdentical] = React.useState<boolean>(true);

    React.useEffect(() => {
        const pos1 = vecS1.map(parseNumber) as [number, number, number];
        const dir1 = vecR1.map(parseNumber) as [number, number, number];
        const pos2 = vecS2.map(parseNumber) as [number, number, number];
        const dir2 = vecR2.map(parseNumber) as [number, number, number];
        console.log([...pos1, ...pos2, ...dir1, ...dir2]);
        if ([...pos1, ...pos2, ...dir1, ...dir2].some(Number.isNaN)) {
            setIsInvalid(true);
            return;
        }
        setIsInvalid(false);
        const result = areIdenticalLines3D(pos1, dir1, pos2, dir2);
        setAreIdentical(result);
    }, [vecS1, vecR1, vecS2, vecR2]);

    return (
        <Layout>
            <main>
                <h1>Geraden Vergleichen</h1>
                <div>
                    <div className={clsx(styles.line)}>
                        <p>Gerade 1:</p>
                        <div className={clsx(styles.equation)}>
                            g<sub>1</sub>:<span className={clsx(styles.vectorText)}>r</span>
                            <span className={clsx(styles.equals)}>=</span>
                            <VectorInput value={vecS1} onChange={setVecS1} />
                            <Icon path={mdiPlus} size={0.7} />
                            <span className={clsx(styles.param)}>t</span>
                            <Icon path={mdiCircleSmall} size={0.7} />
                            <VectorInput value={vecR1} onChange={setVecR1} />
                        </div>
                    </div>
                    <div className={clsx(styles.line)}>
                        <p>Gerade 2:</p>
                        <div className={clsx(styles.equation)}>
                            g<sub>2</sub>:<span className={clsx(styles.vectorText)}>r</span>
                            <span className={clsx(styles.equals)}>=</span>
                            <VectorInput value={vecS2} onChange={setVecS2} />
                            <Icon path={mdiPlus} size={0.7} />
                            <span className={clsx(styles.param)}>t</span>
                            <Icon path={mdiCircleSmall} size={0.7} />
                            <VectorInput value={vecR2} onChange={setVecR2} />
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.result)}>
                    {isInvalid ? (
                        <span className="badge badge--info">Ungültige Eingabe</span>
                    ) : (
                        <p>
                            Die Geraden sind{' '}
                            {areIdentical ? (
                                <span className="badge badge--success">identisch</span>
                            ) : (
                                <span className="badge badge--danger">nicht identisch</span>
                            )}
                        </p>
                    )}
                </div>
            </main>
        </Layout>
    );
};

export default CompareVectorLines;
