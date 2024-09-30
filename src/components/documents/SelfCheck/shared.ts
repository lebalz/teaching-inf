import { StateType } from '@tdev-api/document';

export enum SelfCheckStateType {
    STATE_OPEN = 'unset',
    STATE_WAITING_FOR_SOLUTION = 'star-empty',
    STATE_REVIEWING_SOLUTION = 'star-half',
    STATE_DONE = 'checked',
}
