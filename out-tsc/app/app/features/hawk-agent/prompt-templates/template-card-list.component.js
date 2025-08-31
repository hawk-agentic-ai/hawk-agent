import { __decorate } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
let TemplateCardListComponent = class TemplateCardListComponent {
    constructor() {
        this.templates = [];
        this.selectedIndex = -1;
        this.select = new EventEmitter();
    }
};
__decorate([
    Input()
], TemplateCardListComponent.prototype, "templates", void 0);
__decorate([
    Input()
], TemplateCardListComponent.prototype, "selectedIndex", void 0);
__decorate([
    Output()
], TemplateCardListComponent.prototype, "select", void 0);
TemplateCardListComponent = __decorate([
    Component({
        selector: 'app-pt-card-list',
        standalone: true,
        imports: [CommonModule],
        template: `
    <div class="grid gap-3">
      <div *ngFor="let t of templates; let i = index" (click)="select.emit(i)"
           class="border rounded-md p-3 hover:border-blue-300 cursor-pointer transition-colors"
           [class.border-blue-500]="selectedIndex===i">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium text-gray-900 truncate">{{ t.name }}</div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{{ t.template_category }}</span>
        </div>
        <div class="text-xs text-gray-600 mt-1 line-clamp-2">{{ t.description || t.prompt_text }}</div>
        <div class="mt-2 flex items-center gap-2">
          <span class="text-[11px] px-2 py-0.5 rounded-full" [class]="(t.status==='active' ? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-600')">{{ t.status }}</span>
          <span *ngIf="t.input_fields?.length" class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Dynamic ({{ t.input_fields?.length || 0 }})</span>
          <span *ngIf="t.usage_count!=null" class="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{{ t.usage_count }} uses</span>
        </div>
      </div>
      <div *ngIf="!templates?.length" class="text-sm text-gray-500 p-4 text-center border rounded">No templates found</div>
    </div>
  `
    })
], TemplateCardListComponent);
export { TemplateCardListComponent };
//# sourceMappingURL=template-card-list.component.js.map