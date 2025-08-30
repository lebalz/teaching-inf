import _ from 'es-toolkit/compat';
import { action, observable } from 'mobx';
const SANITIZE_REGEX = /[^ABCDEFGHIKLMNOPQRSTUWXYZ\s]/g;
const QUADRAT = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'W',
    'X',
    'Y',
    'Z',
    ' '
] as const;

type Alphabet = (typeof QUADRAT)[number];

const sanitizeAlphabet = (alphabet: string[]): Alphabet[] => {
    const present = new Set<Alphabet>();
    const sanitized: Alphabet[] = [];
    for (const char of alphabet) {
        if (QUADRAT.includes(char as Alphabet) && !present.has(char as Alphabet)) {
            present.add(char as Alphabet);
            sanitized.push(char as Alphabet);
        }
    }
    return [...sanitized, ..._.shuffle(QUADRAT.filter((char) => !present.has(char)))];
};

const sanitizer = (text: string): Alphabet[] => {
    return text
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .replace(/J/g, 'I')
        .replace(/V/g, 'U')
        .replace(SANITIZE_REGEX, '')
        .split('') as Alphabet[];
};

class Polybios {
    @observable accessor text: string;
    @observable accessor cipherText: string;
    @observable accessor source: 'text' | 'cipher';
    @observable accessor textAreaKey: number = 0;

    @observable.ref accessor alphabet: Alphabet[];

    constructor(alphabet: Alphabet[] = [...QUADRAT]) {
        this.text = '';
        this.cipherText = '';
        this.source = 'text';
        this.alphabet = alphabet;
    }

    @action
    setAlphabet(alphabet: string[]) {
        this.alphabet = sanitizeAlphabet(alphabet);
        this.textAreaKey += 1;
        switch (this.source) {
            case 'cipher':
                this.setCipherText(this.cipherText);
                break;
            case 'text':
                this.setText(this.text);
                break;
        }
    }

    @action
    setText(value: string) {
        const sanitized = sanitizer(value);
        this.text = sanitized.join('');
        const cipher = sanitized.map((char) => {
            const idx = this.alphabet.indexOf(char);
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            return `${row + 1}${col + 1}`;
        });
        this.cipherText = cipher.join(' ');
        this.setSource('text');
    }

    @action
    setCipherText(value: string) {
        const parts = value
            .replace(/\s+/g, ' ')
            .replace(/[^1-5\s]/g, '')
            .split(' ');
        this.cipherText = parts.join(' ');
        const decoded = parts.map((tuple) => {
            const [row, col] = tuple.split('').map((c) => Number.parseInt(c, 10) - 1);
            return this.alphabet[row * 5 + col];
        });
        this.text = decoded.join('');
        this.setSource('cipher');
    }

    @action
    setSource(source: 'text' | 'cipher') {
        if (this.source === source) {
            return;
        }
        this.source = source;
    }

    @action
    shuffleAlphabet() {
        this.setAlphabet(_.shuffle(this.alphabet));
    }
}

export default Polybios;
