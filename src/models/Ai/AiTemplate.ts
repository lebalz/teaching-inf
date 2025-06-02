import { AiStore } from '@tdev-stores/AiStore';
import { action, computed, observable } from 'mobx';
import { AiTemplate as AiTemplateProps, JsonSchema } from '@tdev-api/admin';
import _ from 'lodash';

const UpdateableFields: (keyof AiTemplate)[] = [
    'rateLimit',
    'rateLimitPeriodMs',
    'isActive',
    'model',
    'apiKey',
    'apiUrl',
    'temperature',
    'maxTokens',
    'topP',
    'systemMessage',
    'jsonSchema'
] as const;

class AiTemplate {
    readonly store: AiStore;
    readonly id: string;
    @observable accessor rateLimit: number;
    @observable accessor rateLimitPeriodMs: number;
    @observable accessor isActive: boolean;

    @observable accessor model: string;
    @observable accessor apiKey: string;
    @observable accessor apiUrl: string;

    @observable accessor temperature: number;
    @observable accessor maxTokens: number;
    @observable accessor topP: number;
    @observable accessor systemMessage: string | undefined;
    @observable accessor jsonSchema: JsonSchema | undefined | null;

    @observable.ref accessor _pristine: AiTemplateProps;

    @observable accessor _isEditing: boolean = false;

    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: AiTemplateProps, store: AiStore) {
        this.store = store;
        this._pristine = { ...props };
        this.id = props.id;
        this.rateLimit = props.rateLimit;
        this.rateLimitPeriodMs = props.rateLimitPeriodMs;
        this.isActive = props.isActive;

        this.model = props.model;
        this.apiKey = props.apiKey;
        this.apiUrl = props.apiUrl;

        this.temperature = props.temperature;
        this.maxTokens = props.maxTokens;
        this.topP = props.topP;
        this.systemMessage = props.systemMessage;
        this.jsonSchema = props.jsonSchema;

        this.createdAt = new Date(props.createdAt);
        this.updatedAt = new Date(props.updatedAt);
    }

    @computed
    get isPersisted(): boolean {
        return !this.id.startsWith('new-') && this.id.length > 0;
    }

    @action
    setEditing(isEditing: boolean) {
        this._isEditing = isEditing;
    }

    @computed
    get isEditing(): boolean {
        return this._isEditing || !this.isPersisted;
    }

    @action
    update(props: Partial<AiTemplateProps>) {
        UpdateableFields.forEach((key) => {
            if (key in props) {
                (this as any)[key] = (props as any)[key] as any;
            }
        });
    }

    @computed
    get isDirty(): boolean {
        return !_.isEqual(this._pristine, this.props);
    }

    @computed
    get props(): AiTemplateProps {
        return {
            id: this.id,
            rateLimit: this.rateLimit,
            rateLimitPeriodMs: this.rateLimitPeriodMs,
            isActive: this.isActive,
            model: this.model,
            apiKey: this.apiKey,
            apiUrl: this.apiUrl,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            topP: this.topP,
            systemMessage: this.systemMessage,
            jsonSchema: this.jsonSchema,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    @computed
    get dirtyProps(): Partial<AiTemplateProps> {
        const dirtyProps: Partial<AiTemplateProps> = {};
        UpdateableFields.forEach((key) => {
            if (!_.isEqual((this._pristine as any)[key], (this as any)[key])) {
                (dirtyProps as any)[key] = (this as any)[key];
            }
        });
        return dirtyProps;
    }

    @action
    save() {
        return this.store.updateTemplate(this);
    }
}
export default AiTemplate;
