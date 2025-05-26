import type { BinaryFiles } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface ExcaliData {
    files: BinaryFiles;
    elements: readonly ExcalidrawElement[];
    image: string;
}
