import { action, computed, observable } from 'mobx';

interface VignereStep {
    keyChar: string;
    textChar: string;
    cipherChar: string;
}

class Vignere {
    @observable accessor mode: 'encrypt' | 'decrypt' = 'encrypt';
    state = observable.array<VignereStep>([], { deep: false });

    @action
    setMode(mode: 'encrypt' | 'decrypt') {
        this.mode = mode;
        this.state.clear();
    }

    @action
    addStep(step: VignereStep) {
        switch (this.mode) {
            case 'encrypt':
                this.state.push(step);
                break;
            case 'decrypt':
                // Swap textChar and cipherChar
                this.state.push({
                    keyChar: step.keyChar,
                    textChar: step.cipherChar,
                    cipherChar: step.textChar
                });
                break;
        }
    }

    @action
    reset() {
        this.state.clear();
    }

    @action
    undo() {
        this.state.pop();
    }

    @computed
    get plainText() {
        return this.state.map((step) => step.textChar).join('');
    }

    get keyText() {
        return this.state.map((step) => step.keyChar).join('');
    }

    get cipherText() {
        return this.state.map((step) => step.cipherChar).join('');
    }
}

export default Vignere;
