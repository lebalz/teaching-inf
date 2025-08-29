import { action, computed, observable } from 'mobx';

interface VignereStep {
    keyChar: string;
    textChar: string;
    cipherChar: string;
}

class Vignere {
    state = observable.array<VignereStep>([], { deep: false });

    @action
    addStep(step: VignereStep) {
        this.state.push(step);
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
