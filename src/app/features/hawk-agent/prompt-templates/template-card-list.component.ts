import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptTemplate } from '../../configuration/prompt-templates/prompt-templates.service';

@Component({
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
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700" *ngIf="getSuccess(t,i) != null">{{ getSuccess(t,i) }}% success</span>
          <span *ngIf="t.input_fields?.length" class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Dynamic ({{ t.input_fields?.length || 0 }})</span>
          <span *ngIf="t.usage_count!=null" class="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{{ t.usage_count }} uses</span>
        </div>
      </div>
      <div *ngIf="!templates?.length" class="text-sm text-gray-500 p-4 text-center border rounded">No templates found</div>
    </div>
  `
})
export class TemplateCardListComponent {
  @Input() templates: PromptTemplate[] = [];
  @Input() selectedIndex = -1;
  @Input() successMap: Record<string, number> = {};
  @Output() select = new EventEmitter<number>();

  getSuccess(t: PromptTemplate, i: number): number | null {
    const key = t.id || `idx:${i}`;
    const v = this.successMap[key];
    return (v == null ? null : v);
  }
}
