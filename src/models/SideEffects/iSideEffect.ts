import { DocumentType, TypeDataMapping } from '@site/src/api/document';

abstract class iSideEffect<Type extends DocumentType> {
    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }
    abstract transformer: (document: TypeDataMapping[Type]) => TypeDataMapping[Type];
}

export default iSideEffect;
