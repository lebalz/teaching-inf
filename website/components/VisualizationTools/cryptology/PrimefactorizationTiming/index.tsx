import clsx from 'clsx';
import * as React from 'react';
import shared from '../styles.module.scss';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CopyImageToClipboard from '@tdev-components/shared/CopyImageToClipboard';
import { randomPrime } from '@tdev/utils/prime';
import { useStore } from '@tdev/hooks/useStore';
import { action } from 'mobx';
import Icon from '@mdi/react';
import { SIZE_S, SIZE_XS } from '@tdev-components/shared/iconSizes';
import { mdiCancel, mdiClock, mdiLoading } from '@mdi/js';
import styles from './styles.module.scss';
import Button from '@tdev-components/shared/Button';
import Badge from '@tdev-components/shared/Badge';
const Play =
    'M 7.4219 1.8281 c -0.6938 -0.4266 -1.5656 -0.4406 -2.2734 -0.0422 S 4 2.9344 4 3.75 V 20.25 c 0 0.8156 0.4406 1.5656 1.1484 1.9641 s 1.5797 0.3797 2.2734 -0.0422 L 20.9219 13.9219 c 0.6703 -0.4078 1.0781 -1.1344 1.0781 -1.9219 s -0.4078 -1.5094 -1.0781 -1.9219 L 7.4219 1.8281 Z';

interface StageProps {
    onStage: () => any;
    onCancel?: () => any;
    label: string;
    result: { calculations: string[]; time_ms?: number; size?: number };
    spin?: boolean;
}

const Stage = (props: StageProps) => {
    return (
        <>
            <div className={clsx(shared.stage)}>
                <h4>{props.label}</h4>
                <span style={{ flexGrow: 1 }} />
                {props.spin && props.onCancel && (
                    <Button onClick={props.onCancel} icon={mdiCancel} color="red" size={SIZE_S} />
                )}
                <Button
                    onClick={props.onStage}
                    icon={props.spin ? mdiLoading : Play}
                    spin={props.spin}
                    color="green"
                    noOutline
                    className={styles.button}
                    size={SIZE_S}
                    disabled={props.spin}
                />
            </div>
            <div className={clsx(shared.result)}>
                <span className={styles.props}>
                    {props.result.calculations.map((calc, idx) => (
                        <Badge key={idx} color="gray">
                            {calc}
                        </Badge>
                    ))}
                    {props.result.size && <Badge color="blue">{props.result.size} Stellen</Badge>}
                </span>
                <span style={{ flexGrow: 1 }} />
                {props.result.time_ms !== undefined && (
                    <Badge color="green">
                        <Icon path={Play} size={SIZE_XS} color="white" />
                        <Icon path={mdiClock} size={SIZE_XS} color="white" />{' '}
                        {props.result.time_ms.toFixed(1)} ms
                    </Badge>
                )}
            </div>
        </>
    );
};

const hNumber = (num: bigint) => {
    // BigInt to string with group separators.
    if (typeof num !== 'bigint') return '';
    let s = num.toString();
    let out = '';
    let cnt = 0;
    for (let i = s.length - 1; i >= 0; --i) {
        if (cnt && cnt % 3 === 0) out = "'" + out;
        out = s[i] + out;
        cnt++;
    }
    return out;
};

const DEFAULT_RESULT = { calculations: [] };

const tickFormatter = (tick: number) => {
    return `${tick} Stellen`;
};
function log2BigInt(n: bigint): number {
    if (n <= 0n) throw new Error('log2 only defined for positive numbers');
    return n.toString(2).length - 1;
}
function log10BigInt(n: bigint): number {
    return log2BigInt(n) / Math.log2(10);
}

const PrimefactorizationTiming = () => {
    const [digits, setDigits] = React.useState(6);
    const [range, setRange] = React.useState<[bigint, bigint]>([0n, 0n]);
    const [stage, setStage] = React.useState(0);
    const [prime1, setPrime1] = React.useState<bigint>(0n);
    const [prime2, setPrime2] = React.useState<bigint>(0n);
    const [tPrime, set_tPrime] = React.useState<number>(-1);
    const [measurements, setMeasures] = React.useState<{ product: bigint; time: number }[]>([]);
    const [prod, setProd] = React.useState<bigint>(0n);
    const [tMult, set_tMult] = React.useState<number>(-1);
    const [tFact, set_tFact] = React.useState<number>(-1);
    const [factPrime1, setFactPrime1] = React.useState<bigint>(0n);
    const [factPrime2, setFactPrime2] = React.useState<bigint>(0n);
    const workerRef = React.useRef<Worker | null>(null);
    const [isFactoring, setIsFactoring] = React.useState(false);
    const store = useStore('siteStore').toolsStore;

    React.useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
            setIsFactoring(false);
        };
    }, [prod]);

    React.useEffect(() => {
        setDigits(store.primeFactorizationTiming?.digits || 6);
        setRange(
            store.primeFactorizationTiming?.range
                ? [
                      BigInt(store.primeFactorizationTiming.range[0]),
                      BigInt(store.primeFactorizationTiming.range[1])
                  ]
                : [0n, 0n]
        );
        setStage(store.primeFactorizationTiming?.stage || 0);
        setPrime1(
            store.primeFactorizationTiming?.prime1 ? BigInt(store.primeFactorizationTiming.prime1) : 0n
        );
        setPrime2(
            store.primeFactorizationTiming?.prime2 ? BigInt(store.primeFactorizationTiming.prime2) : 0n
        );
        set_tPrime(store.primeFactorizationTiming?.tPrime || 1);
        setMeasures(
            store.primeFactorizationTiming?.measurements
                ? store.primeFactorizationTiming.measurements.map(({ product, time }: any) => ({
                      product: BigInt(product),
                      time
                  }))
                : []
        );
        setProd(store.primeFactorizationTiming?.prod ? BigInt(store.primeFactorizationTiming.prod) : 0n);
        set_tMult(store.primeFactorizationTiming?.tMult || -1);
        set_tFact(store.primeFactorizationTiming?.tFact || -1);
        setFactPrime1(
            store.primeFactorizationTiming?.factPrime1
                ? BigInt(store.primeFactorizationTiming.factPrime1)
                : 0n
        );
        setFactPrime2(
            store.primeFactorizationTiming?.factPrime2
                ? BigInt(store.primeFactorizationTiming.factPrime2)
                : 0n
        );
    }, []);

    React.useEffect(() => {
        return action(() => {
            store.primeFactorizationTiming = {
                digits,
                range,
                stage,
                prime1,
                prime2,
                tPrime,
                measurements,
                prod,
                tMult,
                tFact,
                factPrime1,
                factPrime2
            };
        });
    }, [
        digits,
        range,
        stage,
        prime1,
        prime2,
        tPrime,
        measurements,
        prod,
        tMult,
        tFact,
        factPrime1,
        factPrime2
    ]);

    React.useEffect(() => {
        setStage(0);
        setRange([BigInt('5'.padEnd(digits, '0')), BigInt('5'.padEnd(digits + 1, '0'))]);
    }, [digits]);

    const onStage1 = () => {
        const t0 = window.performance.now();
        let p1: bigint | null = null;
        let p2: bigint | null = null;
        while (!p1) {
            p1 = randomPrime(range[0], range[1]);
        }
        while (!p2) {
            p2 = randomPrime(range[0], range[1]);
        }
        const minP = p1 < p2 ? p1 : p2;
        const maxP = p1 < p2 ? p2 : p1;
        setPrime1(minP);
        setPrime2(maxP);
        const ellapsed = window.performance.now() - t0;
        set_tPrime(ellapsed);
        setStage(1);
    };

    const onStage2 = () => {
        const t0 = window.performance.now();
        setProd(prime1 * prime2);
        const ellapsed = window.performance.now() - t0;
        set_tMult(ellapsed);
        setStage(2);
    };

    const onStage3 = React.useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
        set_tFact(-1);
        setIsFactoring(true);
        workerRef.current = new Worker(new URL('./factorWorker.ts', import.meta.url), {
            type: 'module'
        });
        const product = prod;
        workerRef.current.onmessage = (e) => {
            workerRef.current?.terminate();
            workerRef.current = null;
            const { elapsed, factors } = e.data;
            setFactPrime1(factors[0] ? BigInt(factors[0]) : 0n);
            setFactPrime2(factors[1] ? BigInt(factors[1]) : 0n);
            set_tFact(elapsed);
            setStage(3);
            setMeasures((m) => [...m, { product: product, time: elapsed }]);
            setIsFactoring(false);
        };
        workerRef.current.postMessage({ n: product.toString() });
    }, [prod]);

    // @ts-ignore
    return (
        <div className={clsx('hero', 'shadow--lw', shared.container, shared.factorization)}>
            <div className="container">
                <p className="hero__subtitle">Zeitanalyse Primfaktorzerlegung</p>
                Primzahlen mit
                <div className={clsx('button-group', shared.digits)}>
                    {[6, 7, 8, 9, 10].map((d) => (
                        <button
                            key={d}
                            className={clsx(
                                'button',
                                'button--sm',
                                'button--outline',
                                'button--primary',
                                digits === d && 'button--active'
                            )}
                            onClick={() => setDigits(d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                Stellen
                <div className={styles.reset}>
                    <Button
                        text="Zurücksetzen"
                        onClick={() => {
                            setMeasures([]);
                            setStage(0);
                            workerRef.current?.terminate();
                            workerRef.current = null;
                            setIsFactoring(false);
                        }}
                    />
                </div>
                <Stage
                    onStage={onStage1}
                    label={`Zwei Primzahlen zwischen ${hNumber(range[0])} und ${hNumber(range[1])} wählen`}
                    result={
                        stage > 0
                            ? {
                                  calculations: [hNumber(prime1), hNumber(prime2)],
                                  time_ms: tPrime
                              }
                            : DEFAULT_RESULT
                    }
                />
                {stage > 0 && (
                    <Stage
                        onStage={onStage2}
                        label={`Primzahlprodukt berechnen: ${hNumber(prime1)} * ${hNumber(prime2)}`}
                        result={
                            stage > 1
                                ? {
                                      calculations: [hNumber(prod)],
                                      size: prod.toString().length,
                                      time_ms: tMult
                                  }
                                : DEFAULT_RESULT
                        }
                    />
                )}
                {stage > 1 && (
                    <>
                        <Stage
                            onStage={onStage3}
                            label={`Primzahlen faktorisieren`}
                            spin={isFactoring}
                            onCancel={() => {
                                workerRef.current?.terminate();
                                workerRef.current = null;
                                setIsFactoring(false);
                                set_tFact(-1);
                                setStage(2);
                            }}
                            result={
                                stage > 2
                                    ? {
                                          calculations: [hNumber(factPrime1), hNumber(factPrime2)],
                                          time_ms: tFact < 0 ? undefined : tFact
                                      }
                                    : DEFAULT_RESULT
                            }
                        />
                    </>
                )}
                {measurements.length > 0 && (
                    <div className={clsx(styles.scatter)}>
                        <CopyImageToClipboard>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart
                                    width={500}
                                    height={300}
                                    margin={{
                                        top: 5,
                                        right: 100,
                                        bottom: 80,
                                        left: 20
                                    }}
                                >
                                    <CartesianGrid />
                                    <XAxis
                                        type="number"
                                        dataKey="product"
                                        name="Stellen"
                                        tickFormatter={tickFormatter}
                                        angle={40}
                                        textAnchor="start"
                                    />
                                    <YAxis type="number" dataKey="time" name="Zeit" unit="ms" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter
                                        name="Mesurements"
                                        data={measurements.map(({ product, time }, idx) => ({
                                            product: product.toString().length,
                                            time
                                        }))}
                                        fill="#8884d8"
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CopyImageToClipboard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrimefactorizationTiming;
