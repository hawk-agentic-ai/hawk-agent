import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pt-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-3">
      <div *ngIf="!hideFamily">
        <label class="block text-xs font-medium text-gray-600 mb-1">Family</label>
        <select class="filter-input w-full" [ngModel]="selectedFamily" (ngModelChange)="familyChange.emit($event)">
          <option value="">All</option>
          <option *ngFor="let f of families" [value]="f.value">{{ f.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Search</label>
        <input class="filter-input w-full" type="text" [ngModel]="search" (ngModelChange)="searchChange.emit($event)" placeholder="Search templates..."/>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-2">Categories</label>
        <div class="space-y-1 max-h-[320px] overflow-y-auto pr-1">
          <button *ngFor="let c of categories" class="w-full px-3 py-2 rounded text-left text-sm hover:bg-gray-50"
                  [class.bg-blue-50]="selectedCategory === c.value"
                  (click)="categoryChange.emit(c.value)">
            <span class="mr-2">{{ c.label }}</span>
            <span class="text-xs text-gray-500">{{ c.count }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class PromptFiltersPanelComponent {
  @Input() families: {label: string, value: string}[] = [];
  @Input() categories: {label: string, value: string, count: number}[] = [];
  @Input() selectedFamily = '';
  @Input() selectedCategory = '';
  @Input() search = '';
  @Input() hideFamily = false;
  @Output() familyChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  get categoriesTotal(): number { return this.categories.reduce((s,c)=> s + (c.count||0), 0); }
}
