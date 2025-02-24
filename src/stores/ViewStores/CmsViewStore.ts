import { CmsStore } from '@tdev-stores/CmsStore';
import iViewStore from './iViewStore';
import { action, computed, observable } from 'mobx';

export default class CmsViewStore extends iViewStore<CmsStore> {
    @observable accessor isMobile = false;
    @observable accessor showFileTree = false;
    @observable accessor isNavOverviewExpanded = false;
    @observable accessor openInlineMathEditor: string | null = null;

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
        if (!isMobile && !this.showFileTree) {
            this.setShowFileTree(true);
        } else if (isMobile && this.showFileTree) {
            this.setShowFileTree(false);
        }
    }
    @action
    setIsNavOverviewExpanded(isExpanded: boolean) {
        this.isNavOverviewExpanded = isExpanded;
    }
    @action
    setOpenInlineMathEditor(id: string | null) {
        this.openInlineMathEditor = id;
    }

    @computed
    get canDisplayFileTree() {
        return !this.isMobile;
    }

    cleanup() {
        // noop
    }
}
