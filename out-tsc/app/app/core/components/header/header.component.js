import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
let HeaderComponent = class HeaderComponent {
    constructor() {
        this.title = '';
        this.subtitle = '';
        this.selectedDate = new Date();
    }
};
__decorate([
    Input()
], HeaderComponent.prototype, "title", void 0);
__decorate([
    Input()
], HeaderComponent.prototype, "subtitle", void 0);
__decorate([
    Input()
], HeaderComponent.prototype, "badge", void 0);
HeaderComponent = __decorate([
    Component({
        selector: 'app-header',
        standalone: true,
        imports: [CommonModule, CalendarModule, FormsModule],
        template: `
    <header class="bg-white border-b border-gray-200 px-6 py-5 shadow-sm z-10" style="height: 86px;">
      <div class="flex items-center justify-between h-full">
        <!-- Title Section -->
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center">
            {{ title }}
            <span *ngIf="badge" class="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{{ badge }}</span>
          </h1>
          <span class="text-sm text-gray-600 mt-1.5">{{ subtitle }}</span>
        </div>

        <!-- Date Picker Section -->
        <div class="flex items-center bg-gray-50 rounded-md px-4 py-2.5 border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <label class="text-sm font-medium text-gray-700 mr-3">As of Date:</label>
          <p-calendar 
            [(ngModel)]="selectedDate"
            [showIcon]="true"
            [iconDisplay]="'input'"
            [dateFormat]="'dd/mm/yy'"
            [placeholder]="'Select Date'"
            styleClass="header-calendar"
            class="text-sm">
          </p-calendar>
        </div>
      </div>
    </header>
  `,
        styles: [`
    :host ::ng-deep .header-calendar .p-calendar {
      border: none;
      background-color: transparent;
    }
    :host ::ng-deep .header-calendar .p-inputtext {
      border: none;
      background-color: transparent;
      font-weight: 500;
      color: #3B82F6;
      padding-left: 0;
      min-width: 110px;
    }
    :host ::ng-deep .header-calendar .p-button {
      background-color: transparent;
      border: none;
      color: #3B82F6;
    }
    :host ::ng-deep .header-calendar .p-datepicker-trigger:hover {
      background-color: rgba(59, 130, 246, 0.1);
    }
  `]
    })
], HeaderComponent);
export { HeaderComponent };
//# sourceMappingURL=header.component.js.map