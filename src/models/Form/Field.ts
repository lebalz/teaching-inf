import { action, computed, observable } from 'mobx';
import Form from '.';

export interface FormField<T> {
    name: string;
    value?: T;
    description?: string;
    placeholder?: string;
    lang?: string;
    required?: boolean;
    type: React.HTMLInputTypeAttribute | 'expression';
    label?: string;
    resettable?: boolean;
    sideEffect?: (fields: Form<T>) => void;
}

export default class Field<T = string> {
    readonly form: Form<T>;
    readonly name: string;
    readonly type: React.HTMLInputTypeAttribute | 'expression';
    readonly description?: string;
    readonly placeholder?: string;
    readonly lang?: string;
    readonly required?: boolean;
    readonly label?: string;
    readonly resettable?: boolean;
    readonly _pristine: T | undefined;
    readonly sideEffect?: (fields: Form<T>) => void;
    readonly isInitField: boolean;

    @observable accessor value: T;

    constructor(data: FormField<T>, form: Form<T>, isInit = false) {
        this.form = form;
        this.isInitField = isInit;
        this.name = data.name;
        this.value = data.value ?? form.defaultValue;
        this._pristine = data.value;
        this.description = data.description;
        this.placeholder = data.placeholder;
        this.lang = data.lang;
        this.required = data.required;
        this.type = data.type;
        this.label = data.label;
        this.resettable = data.resettable;
        this.sideEffect = data.sideEffect;
    }

    @action
    resetValue(skipSideEffects?: boolean) {
        this.setValue(this.form.defaultValue, skipSideEffects);
    }

    @action
    setValue(value: T, skipSideEffects?: boolean) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (!skipSideEffects) {
            this.form.runSideEffect(this);
        }
    }

    @computed
    get isDirty() {
        return this.value !== this._pristine;
    }

    @computed
    get isCheckbox() {
        return this.type === 'checkbox';
    }

    @computed
    get checkboxValue() {
        return this.value === 'true';
    }
}
