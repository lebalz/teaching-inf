import { CmsStore } from '@tdev-stores/CmsStore';
import iViewStore from './iViewStore';
import { action, computed, observable } from 'mobx';

export default class CmsViewStore extends iViewStore<CmsStore> {
    @observable accessor isMobile = false;
    @observable accessor showFileTree = false;
    @observable accessor isPrOverviewExpanded = false;

    constructor(parent: CmsStore) {
        super(parent);
    }

    @action
    setShowFileTree(show: boolean) {
        this.showFileTree = show;
    }

    @action
    setIsMobile(isMobile: boolean) {
        this.isMobile = isMobile;
    }
    @action
    setIsPrOverviewExpanded(isExpanded: boolean) {
        this.isPrOverviewExpanded = isExpanded;
    }

    @computed
    get canDisplayFileTree() {
        return !this.isMobile;
    }

    cleanup() {
        // noop
    }
}
