import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
let LayoutService = class LayoutService {
    constructor() {
        // Default both sidebars to collapsed; expand on hover/navigation only
        this.mainSidebarCollapsed = signal(true);
        this.subSidebarCollapsed = signal(true);
        this.subSidebarVisible = signal(false);
        this.mainSidebarHovered = signal(false);
        this.subSidebarHovered = signal(false);
        this.navigationInProgress = signal(false);
    }
    isMainSidebarCollapsed() {
        return this.mainSidebarCollapsed();
    }
    isSubSidebarCollapsed() {
        return this.subSidebarCollapsed();
    }
    isSubSidebarVisible() {
        return this.subSidebarVisible();
    }
    toggleMainSidebar() {
        this.mainSidebarCollapsed.update(value => !value);
    }
    toggleSubSidebar() {
        this.subSidebarCollapsed.update(value => !value);
    }
    showSubSidebar() {
        this.subSidebarVisible.set(true);
    }
    hideSubSidebar() {
        this.subSidebarVisible.set(false);
    }
    getMainSidebarWidth() {
        return this.isMainSidebarCollapsed() ? '64px' : '280px';
    }
    getSubSidebarWidth() {
        return this.isSubSidebarCollapsed() ? '64px' : '240px';
    }
    // Hover state management
    setMainSidebarHovered(hovered) {
        this.mainSidebarHovered.set(hovered);
    }
    setSubSidebarHovered(hovered) {
        this.subSidebarHovered.set(hovered);
    }
    isMainSidebarHovered() {
        return this.mainSidebarHovered();
    }
    isSubSidebarHovered() {
        return this.subSidebarHovered();
    }
    // Effective state considering hover
    isMainSidebarEffectivelyCollapsed() {
        return this.mainSidebarCollapsed() && !this.mainSidebarHovered();
    }
    isSubSidebarEffectivelyCollapsed() {
        return this.subSidebarCollapsed() && !this.subSidebarHovered();
    }
    // Navigation state management
    setNavigationInProgress(inProgress) {
        this.navigationInProgress.set(inProgress);
    }
    isNavigationInProgress() {
        return this.navigationInProgress();
    }
    // Auto-collapse after navigation
    completeNavigation() {
        this.setNavigationInProgress(false);
        // Auto-collapse both sidebars after navigation completes
        setTimeout(() => {
            if (!this.mainSidebarHovered() && !this.subSidebarHovered()) {
                this.mainSidebarCollapsed.set(true);
                this.subSidebarCollapsed.set(true);
            }
        }, 500); // 500ms delay to allow user to continue hovering if needed
    }
};
LayoutService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], LayoutService);
export { LayoutService };
//# sourceMappingURL=layout.service.js.map