import { StateType } from '@tdev-api/document';

export enum SelfCheckStateType {
    OPEN = 'unset',
    QUESTION = 'question',
    WAITING_FOR_SOLUTION = 'star-empty',
    REVIEWING_SOLUTION = 'star-half',
    DONE = 'checked',
}
