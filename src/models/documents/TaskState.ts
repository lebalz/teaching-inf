import { action, computed } from 'mobx';
import iDocument from '../iDocument';
import { DocumentType, Document as DocumentProps, TaskStateData } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';

class TaskState extends iDocument<DocumentType.TaskState> {
    constructor(props: DocumentProps<DocumentType.TaskState>, store: DocumentStore) {
        super(props, store);
    }

    setData(data: TaskStateData): void {
        throw new Error('Not implemented.');
    }

    get data() {
        return this._pristine;
    }
}

export default TaskState;
