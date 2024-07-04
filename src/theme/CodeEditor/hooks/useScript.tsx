import Document from "@site/src/models/Document";
import { useCallback, useSyncExternalStore } from "react";
/**
 * A utility function to create a stable snapshot wrapper
 * it is meant to only track the length of the array and treats
 * two arrays with the same length as equal
 */
const useStableSnapshot = (getSnapshot: () => Array<any>) => {
    let prevLength: number = -1;
    let prevResult: Array<any>;
    return () => {
        const result = getSnapshot();
        if (result.length !== prevLength) {
            prevLength = result.length;
            prevResult = result.slice();
        }
        return prevResult;
    };
};


export const useScript = <T extends keyof Document>(model: Document, selector: T): Document[T] => {
    const isArray = Array.isArray(model[selector]);
    if (isArray) {
        /**
         * arrays are treated differently as they are expected to be
         * immutable, so we can use a stable snapshot to track changes
         * in the array
         */
        return useSyncExternalStore(
            useCallback((callback) => {
                return model.subscribe(callback, selector);
            }, [model, selector]),
            useCallback(
                useStableSnapshot(() => {
                    return model[selector] as Array<any>;
                }) as () => Document[T],
                [model, selector]
            )
        );
    }
    return useSyncExternalStore(
        useCallback((callback) => {
            return model.subscribe(callback, selector);
        }, [model, selector]),
        useCallback(
            () => {
                return model[selector];
            },
            [model, selector]
        )
    );
}