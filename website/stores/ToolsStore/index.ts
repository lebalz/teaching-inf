import { RootStore } from '@site/src/stores/rootStore';
import { action, observable } from 'mobx';
import Polybios from './Polybios';
import Vignere from './Vignere';
import ClockStore from './ClockStore';

type Source = 'text' | 'cipher';

export class ToolsStore {
    @observable.ref accessor caesar: {
        text: string;
        cipher: string;
        key: string;
        source: 'text' | 'cipher';
    } = {
        text: '',
        cipher: '',
        key: 'D',
        source: 'text'
    };

    @observable.ref accessor frequencyAnalysis: {
        text: string;
        sortAlphabetic: boolean;
        onlyLetters: boolean;
        indicateUnusedChars: boolean;
    } = {
        text: 'Hallo',
        sortAlphabetic: true,
        onlyLetters: false,
        indicateUnusedChars: true
    };

    @observable.ref accessor hashSha256: { text: string } = {
        text: ''
    };

    @observable.ref accessor imageEncryption: {
        imageDataUrl: string;
        srcImageLoaded: boolean;
        resultReady: boolean;
        mode: 'ECB' | 'CBC';
        key: string;
        iv: string;
    } = {
        imageDataUrl: '',
        srcImageLoaded: false,
        resultReady: false,
        mode: 'ECB',
        key: '',
        iv: ''
    };

    @observable.ref accessor polybios = new Polybios();
    @observable.ref accessor vignere = new Vignere();
    @observable.ref accessor clockStore = new ClockStore();

    @observable.ref accessor primeFactorizationTiming: {
        digits: number;
        range: [bigint, bigint];
        stage: number;
        prime1: bigint;
        prime2: bigint;
        tPrime: number;
        measurements: { product: bigint; time: number }[];
        prod: bigint;
        tMult: number;
        tFact: number;
        factPrime1: bigint;
        factPrime2: bigint;
    } = {
        digits: 6,
        range: [0n, 0n],
        stage: 0,
        prime1: 0n,
        prime2: 0n,
        tPrime: -1,
        measurements: [],
        prod: 0n,
        tMult: -1,
        tFact: -1,
        factPrime1: 0n,
        factPrime2: 0n
    };

    @observable.ref accessor skytale: { text: string; cipherText: string; key: number; source: Source } = {
        text: '',
        cipherText: '',
        key: 2,
        source: 'text'
    };

    @observable.ref accessor substitution: {
        text: string;
        key: string;
        missingChars: string[];
        duplicatedChars: string[];
        cipherText: string;
        source: Source;
    } = {
        text: '',
        key: '',
        missingChars: [],
        duplicatedChars: [],
        cipherText: '',
        source: 'text'
    };

    @observable.ref accessor xorBlockCipher: {
        text: string;
        cipherText: string;
        key: string;
        mode: 'CBC' | 'ECB';
        iv: string;
        source: Source;
    } = {
        text: '',
        cipherText: '',
        key: '',
        mode: 'ECB',
        iv: '',
        source: 'text'
    };

    @observable.ref accessor pentacode: { text: string; penta: string; source: 'text' | 'penta' } = {
        text: '',
        penta: '',
        source: 'text'
    };

    @observable.ref accessor pentacodePixelEditor: { penta: string; source: 'cell' | 'editor' | '' } = {
        penta: '00000 00000 00000 00000 00000',
        source: 'editor'
    };

    @observable.ref accessor colorExchange: {
        colorA: number;
        colorB: number;
        colorS: number;
    } = {
        colorA: 60,
        colorB: 230,
        colorS: 100
    };

    textFieldPlaygrounds = observable.map<string, string>();

    constructor(private root: RootStore) {}

    @action
    setTextFieldValue(id: string, value: string) {
        this.textFieldPlaygrounds.set(id, value);
    }
}
