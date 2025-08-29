import React from 'react';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CopyImageToClipboard from '@tdev-components/shared/CopyImageToClipboard';
import { useStore } from '@tdev/hooks/useStore';
import { action } from 'mobx';
import Button from '@tdev-components/shared/Button';
import { mdiToggleSwitch, mdiToggleSwitchOffOutline } from '@mdi/js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SWITCH_SIZE = { width: 35, height: 18 };

const FrequencyAnalysis = () => {
    const [text, setText] = React.useState('Hallo');
    const [sortAlphabetic, setSortAlphabetic] = React.useState(true);
    const [onlyLetters, setOnlyLetters] = React.useState(false);
    const [indicateUnusedChars, setIndicateUnusedChars] = React.useState(true);
    const [data, setData] = React.useState<
        {
            char: string;
            count: number;
        }[]
    >([]);
    const toolsStore = useStore('siteStore').toolsStore;

    React.useEffect(() => {
        setText(toolsStore.frequencyAnalysis?.text || '');
        setSortAlphabetic(toolsStore.frequencyAnalysis?.sortAlphabetic);
        setOnlyLetters(toolsStore.frequencyAnalysis?.onlyLetters);
        setIndicateUnusedChars(toolsStore.frequencyAnalysis?.indicateUnusedChars);
    }, []);

    React.useEffect(() => {
        return action(() => {
            toolsStore.frequencyAnalysis = {
                text,
                sortAlphabetic,
                onlyLetters,
                indicateUnusedChars
            };
        });
    }, [text, sortAlphabetic, onlyLetters, indicateUnusedChars]);

    React.useEffect(() => {
        const freq: { [key: string]: number } = {};
        if (indicateUnusedChars) {
            ALPHABET.forEach((k) => (freq[k] = 0));
        }
        let processedText = text.toUpperCase().replace(/\s/g, ' ');
        if (onlyLetters) {
            processedText = processedText.replace(/[^A-Z]/g, '');
        }
        const charCount = processedText.length;
        processedText.split('').forEach((char) => {
            if (/\s/.test(char) || (onlyLetters && !/[A-Z]/.test(char))) {
                return;
            }
            freq[char] = (freq[char] || 0) + 1;
        });
        if (charCount === 0) {
            return setData([]);
        }
        const analyzed = Object.entries(freq).map<{ char: string; count: number }>(([char, cnt]) => ({
            char: char,
            count: (100 * (cnt as number)) / charCount
        }));
        if (sortAlphabetic) {
            analyzed.sort((a, b) => (a.char > b.char ? 1 : -1));
        } else {
            analyzed.sort((a, b) => b.count - a.count);
        }
        setData(analyzed);
    }, [text, sortAlphabetic, onlyLetters, indicateUnusedChars]);

    return (
        <div className={clsx('hero', 'shadow--lw', styles.container)}>
            <div className="container">
                <p className="hero__subtitle">Häufigkeitsanalyse</p>
                <h4>Klartext</h4>
                <textarea
                    className={clsx(styles.input)}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                ></textarea>
                <div className={clsx('button-block')}>
                    <Button
                        onClick={() => {
                            setSortAlphabetic(!sortAlphabetic);
                        }}
                        icon={sortAlphabetic ? mdiToggleSwitch : mdiToggleSwitchOffOutline}
                        color={sortAlphabetic ? 'primary' : 'default'}
                    />{' '}
                    <label htmlFor="freq-sort-order">
                        {sortAlphabetic ? 'Sortiere alphabetisch' : 'Sortiere nach Häufigkeit'}
                    </label>
                </div>
                <div>
                    <Button
                        onClick={() => {
                            setOnlyLetters(!onlyLetters);
                        }}
                        icon={onlyLetters ? mdiToggleSwitch : mdiToggleSwitchOffOutline}
                        color={onlyLetters ? 'primary' : 'default'}
                    />{' '}
                    <label htmlFor="freq-filter">{onlyLetters ? 'Nur Buchstaben' : 'Alle Zeichen'}</label>
                </div>
                <div>
                    <Button
                        onClick={() => {
                            setIndicateUnusedChars(!indicateUnusedChars);
                        }}
                        icon={indicateUnusedChars ? mdiToggleSwitch : mdiToggleSwitchOffOutline}
                        color={indicateUnusedChars ? 'primary' : 'default'}
                    />{' '}
                    <label htmlFor="freq-indicate-unused">
                        {indicateUnusedChars
                            ? 'Platzhalter für vorkommende Buchstaben'
                            : 'Nur vorkommende Buchstaben'}
                    </label>
                </div>
                <div style={{ maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
                    <div style={{ width: 'max(98%, 500px)' }}>
                        <CopyImageToClipboard options={{ backgroundColor: 'white' }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={data}
                                    width={500}
                                    height={300}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 0,
                                        bottom: 5
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="char" />
                                    <YAxis unit="%" name="foo" />
                                    <Bar dataKey="count" fill="#ffba00" />
                                    <Tooltip
                                        formatter={(value, name, props) => [`${value} %`, 'Häufigkeit']}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CopyImageToClipboard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrequencyAnalysis;
