import { __decorate } from "tslib";
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
let ApportionmentTableComponent = class ApportionmentTableComponent {
    constructor(svc) {
        this.svc = svc;
        this.rows = [];
        this.search = '';
        this.status = null;
        this.executionDate = null;
        this.navType = null;
        this.showDialog = false;
        this.selected = null;
        this.columnDefs = [
            { field: 'allocation_id', headerName: 'Allocation ID', width: 160 },
            { field: 'request_id', headerName: 'Request ID', width: 160 },
            { field: 'entity_id', headerName: 'Entity', width: 140 },
            { field: 'currency_code', headerName: 'Currency', width: 100 },
            { field: 'nav_type', headerName: 'NAV Type', width: 120 },
            { field: 'execution_date', headerName: 'Execution', width: 130 },
            { field: 'allocation_status', headerName: 'Status', width: 120 },
            { field: 'hedged_position', headerName: 'Hedged', width: 120, type: 'numericColumn' },
            { field: 'unhedged_position', headerName: 'Unhedged', width: 120, type: 'numericColumn' },
            { field: 'available_amount_for_hedging', headerName: 'Avail Hedge', width: 140, type: 'numericColumn' },
            { field: 'hedge_amount_allocation', headerName: 'Alloc Hedge', width: 140, type: 'numericColumn' },
            { field: 'buffer_percentage', headerName: 'Buffer %', width: 110 },
            { field: 'buffer_amount', headerName: 'Buffer Amt', width: 120, type: 'numericColumn' },
            { field: 'car_amount_distribution', headerName: 'CAR Dist', width: 120, type: 'numericColumn' },
            { field: 'manual_overlay_amount', headerName: 'Overlay', width: 120, type: 'numericColumn' },
            { field: 'notes', headerName: 'Notes', flex: 1 },
            { headerName: 'Actions', width: 100, pinned: 'right', cellRenderer: (p) => {
                    const btn = document.createElement('button');
                    btn.className = 'text-gray-500 hover:text-blue-600 p-1';
                    btn.title = 'View Details';
                    btn.innerHTML = '<i class="pi pi-eye"></i>';
                    btn.addEventListener('click', () => p.context.componentParent.viewRow(p.data));
                    return btn;
                } }
        ];
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
        this.gridOptions = { pagination: true, paginationPageSize: 25, animateRows: true, context: { componentParent: this } };
    }
    ngOnInit() { this.load(); this.svc.subscribeRealtime(() => this.load()); }
    async load() {
        this.rows = await this.svc.list({
            search: this.search || undefined,
            status: this.status || undefined,
            executionDate: this.executionDate || undefined,
            navType: this.navType || undefined
        });
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 50);
    }
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    viewRow(row) { this.selected = row; this.showDialog = true; }
    onResize() { setTimeout(() => this.gridApi?.sizeColumnsToFit(), 100); }
};
__decorate([
    HostListener('window:resize')
], ApportionmentTableComponent.prototype, "onResize", null);
ApportionmentTableComponent = __decorate([
    Component({
        selector: 'app-operations-apportionment-table',
        standalone: true,
        imports: [CommonModule, FormsModule, AgGridAngular, DialogModule, ButtonModule],
        template: `
    <div class="p-6 h-full flex flex-col">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Apportionment Table</h2>
        <p class="text-gray-600">Live from allocation_engine (Supabase)</p>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-row w-full">
          <div class="flex items-center space-x-2">
            <label class="filter-label">Search:</label>
            <input class="filter-input w-72" placeholder="allocation_id, request_id, entity, currency" [(ngModel)]="search" (ngModelChange)="load()" />
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Status:</label>
            <input class="filter-input w-48" [(ngModel)]="status" (ngModelChange)="load()" placeholder="e.g., Completed"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Execution Date:</label>
            <input type="date" class="filter-input" [(ngModel)]="executionDate" (ngModelChange)="load()"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">NAV Type:</label>
            <input class="filter-input w-40" [(ngModel)]="navType" (ngModelChange)="load()" placeholder="e.g., Trading"/>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200" style="height: 600px;">
        <ag-grid-angular class="ag-theme-alpine w-full" style="width:100%; height:100%;"
          [columnDefs]="columnDefs" [rowData]="rows" [defaultColDef]="defaultColDef" [gridOptions]="gridOptions" (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>

      <!-- View Dialog -->
      <p-dialog header="Allocation Details" [(visible)]="showDialog" [modal]="true" [style]="{width: '100vw', height: '95vh', 'max-width': '100vw', 'max-height': '95vh', 'border-top-left-radius': '16px', 'border-top-right-radius': '16px'}" styleClass="entity-dialog entity-dialog-full">
        <div class="space-y-4 p-2" *ngIf="selected">
          <!-- Identifiers -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Identifiers</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Allocation ID</div><div class="font-medium">{{selected.allocation_id}}</div></div>
                <div><div class="text-gray-500">Request ID</div><div class="font-mono">{{selected.request_id}}</div></div>
                <div><div class="text-gray-500">Entity</div><div class="font-medium">{{selected.entity_id}}</div></div>
                <div><div class="text-gray-500">Currency</div><div class="font-medium">{{selected.currency_code}}</div></div>
                <div><div class="text-gray-500">NAV Type</div><div class="font-medium">{{selected.nav_type}}</div></div>
              </div>
            </div>
          </div>

          <!-- Metrics -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Metrics</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">SFX Position</div><div class="font-medium">{{selected.sfx_position}}</div></div>
                <div><div class="text-gray-500">Hedged Position</div><div class="font-medium">{{selected.hedged_position}}</div></div>
                <div><div class="text-gray-500">Unhedged Position</div><div class="font-medium">{{selected.unhedged_position}}</div></div>
                <div><div class="text-gray-500">Available for Hedging</div><div class="font-medium">{{selected.available_amount_for_hedging}}</div></div>
                <div><div class="text-gray-500">Hedge Allocation</div><div class="font-medium">{{selected.hedge_amount_allocation}}</div></div>
                <div><div class="text-gray-500">Buffer %</div><div class="font-medium">{{selected.buffer_percentage}}</div></div>
                <div><div class="text-gray-500">Buffer Amount</div><div class="font-medium">{{selected.buffer_amount}}</div></div>
                <div><div class="text-gray-500">CAR Amount Distribution</div><div class="font-medium">{{selected.car_amount_distribution}}</div></div>
                <div><div class="text-gray-500">Manual Overlay Amount</div><div class="font-medium">{{selected.manual_overlay_amount}}</div></div>
              </div>
            </div>
          </div>

          <!-- Execution & Status -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Execution & Status</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Execution Date</div><div class="font-medium">{{selected.execution_date}}</div></div>
                <div><div class="text-gray-500">Allocation Status</div><div class="font-medium">{{selected.allocation_status}}</div></div>
                <div><div class="text-gray-500">CAR Exemption</div><div class="font-medium">{{selected.car_exemption_flag}}</div></div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Notes</div></div>
              <div class="col-span-12 md:col-span-9">
                <div class="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">{{selected.notes}}</div>
              </div>
            </div>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button class="btn btn-secondary" (click)="showDialog=false">Close</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
    })
], ApportionmentTableComponent);
export { ApportionmentTableComponent };
//# sourceMappingURL=apportionment-table.component.js.map