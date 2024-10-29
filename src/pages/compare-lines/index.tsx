import React from 'react';
import Layout from '@theme/Layout';
import siteConfig from '@generated/docusaurus.config';
import styles from './styles.module.scss';
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

const areIdenticalLines3D = (
    p1: [number, number, number],
    d1: [number, number, number],
    p2: [number, number, number],
    d2: [number, number, number],
    epsilon = 1e-10
): boolean => {
    const [x1, y1, z1] = d1;
    const [x2, y2, z2] = d2;

    const crossProduct = [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];

    const areDirectionVectorsParallel =
        Math.abs(crossProduct[0]) < epsilon &&
        Math.abs(crossProduct[1]) < epsilon &&
        Math.abs(crossProduct[2]) < epsilon;

    if (!areDirectionVectorsParallel) {
        return false;
    }

    const difference = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

    const crossProductWithDifference = [
        difference[1] * d1[2] - difference[2] * d1[1],
        difference[2] * d1[0] - difference[0] * d1[2],
        difference[0] * d1[1] - difference[1] * d1[0]
    ];

    return (
        Math.abs(crossProductWithDifference[0]) < epsilon &&
        Math.abs(crossProductWithDifference[1]) < epsilon &&
        Math.abs(crossProductWithDifference[2]) < epsilon
    );
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
