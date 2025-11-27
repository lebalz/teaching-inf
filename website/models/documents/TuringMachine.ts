import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import {
    DocumentType,
    Document as DocumentProps,
    TypeDataMapping,
    Access,
    TuringState
} from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';

export interface MetaInit {}

export class TuringMachineMeta extends TypeMeta<DocumentType.TuringMachine> {
    readonly type = DocumentType.TuringMachine;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.TuringMachine, undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.TuringMachine] {
        return {
            band: [],
            program: [],
            initialHeadPosition: 0,
            initialState: 'z1'
        };
    }
}

class TuringMachine extends iDocument<DocumentType.TuringMachine> {
    program = observable.array<TuringState>([]);
    band = observable.array<string>([]);
    @observable accessor initialHeadPosition: number = 0;
    @observable accessor initialState: string = 'z1';
    @observable accessor headPosition: number = 0;
    @observable accessor currentState: string = 'z1';

    constructor(props: DocumentProps<DocumentType.TuringMachine>, store: DocumentStore) {
        super(props, store);
        this.band.replace(props.data.band);
        this.program.replace(props.data.program);
        this.initialHeadPosition = props.data.initialHeadPosition;
        this.initialState = props.data.initialState;
        this.headPosition = this.initialHeadPosition;
        this.currentState = this.initialState;
    }

    @action
    setData(data: TypeDataMapping[DocumentType.TuringMachine], from: Source, updatedAt?: Date): void {
        this.band.replace(data.band);
        this.program.replace(data.program);
        this.initialHeadPosition = data.initialHeadPosition;
        this.initialState = data.initialState;
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.TuringMachine] {
        return {
            band: this.band.slice(),
            program: this.program.slice(),
            initialHeadPosition: this.initialHeadPosition,
            initialState: this.initialState
        };
    }

    @action
    processStep() {
        const currentSymbol = this.band[this.headPosition];
        const transition = this.program.find(
            (rule) => rule.state === this.currentState && rule.readSymbol === currentSymbol
        );
        if (!transition) {
            // No valid transition, halt the machine
            console.log('No valid transition found. Halting the machine.');
            return null;
        }
        // Write the symbol
        this.band[this.headPosition] = transition.writeSymbol;
        // Move the head
        if (transition.moveDirection === 'R') {
            this.headPosition += 1;
            if (this.headPosition >= this.band.length) {
                this.band.push('_'); // blank symbol
            }
        } else if (transition.moveDirection === 'L') {
            this.headPosition -= 1;
            if (this.headPosition < 0) {
                this.band.unshift('_'); // blank symbol
                this.headPosition = 0;
            }
        }
        // Update the current state
        this.currentState = transition.nextState;
        return this.currentState;
    }

    @computed
    get meta(): TuringMachineMeta {
        if (this.root?.type === DocumentType.TuringMachine) {
            return this.root.meta as TuringMachineMeta;
        }
        return new TuringMachineMeta({});
    }

    /**
     * for now, only admins can edit cms texts
     */
    @computed
    get canEdit(): boolean {
        return !!this.store.root.userStore.current?.hasElevatedAccess;
    }
}

export default TuringMachine;
