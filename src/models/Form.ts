import _ from 'lodash';
import { action, computed, observable } from 'mobx';

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
    sideEffect?: (
        props: Record<string, T>,
        initial: Record<string, T>
    ) => { name: string; value: T }[] | void;
}

export default class Form<T = string> {
    readonly _pristine: FormField<T>[];
    readonly _initValues: Record<string, T>;
    readonly configs: Map<string, FormField<T>>;
    readonly defaultValue: T;
    fields = observable.map<string, T>();

    constructor(fields: FormField<T>[], defaultValue: T) {
        this.defaultValue = defaultValue;
        this._initValues = fields.reduce<Record<string, T>>(
            (acc, { value, name }) => ({ ...acc, [name]: value || defaultValue }),
            {}
        );
        this.configs = new Map(fields.map((f) => [f.name, f]));
        this.fields.replace(this._initValues);
        this._pristine = fields;
    }

    @action
    resetAll() {
        this.fields.replace(this._initValues);
    }

    @action
    resetField(name: string) {
        const init = this.configs.get(name);
        if (init) {
            this.setValue(name, init.value || this.defaultValue);
        } else {
            this.removeField(name);
        }
    }

    @action
    setValue(name: string, value: T, skipSideEffects?: boolean) {
        this.fields.set(name, value);
        if (skipSideEffects) {
            return;
        }
        const config = this._pristine.find((c) => c.name === name);
        if (config?.sideEffect) {
            const sideEffects = config.sideEffect(this.values, _.cloneDeep(this._initValues));
            if (sideEffects) {
                sideEffects.forEach(({ name, value }) => {
                    this.setValue(name, value, true);
                });
            }
        }
    }

    @computed
    get fieldNames() {
        return [...this.fields.keys()];
    }

    @computed
    get values() {
        const res: Record<string, T> = {};
        this.fields.forEach((val, key) => {
            res[key] = val;
        });
        return res;
    }

    isCheckbox(name: string) {
        return this.getConfig(name)?.type === 'checkbox';
    }

    @computed
    get dirtyFields() {
        const dirty = new Set<string>();
        this.fields.forEach((val, key) => {
            if (key in this._initValues) {
                if (val !== this._initValues[key]) {
                    dirty.add(key);
                }
            } else {
                dirty.add(key);
            }
        });
        return dirty;
    }

    getValue(name: string) {
        return this.fields.get(name);
    }

    getConfig(name: string) {
        return this.configs.get(name);
    }

    @action
    removeField(name: string) {
        this.fields.delete(name);
    }
}
