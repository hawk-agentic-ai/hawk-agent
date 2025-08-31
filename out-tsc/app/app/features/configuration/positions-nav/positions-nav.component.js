import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
let PositionsNavComponent = class PositionsNavComponent {
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    constructor(zone, svc, currencySvc) {
        this.zone = zone;
        this.svc = svc;
        this.currencySvc = currencySvc;
        this.rows = [];
        this.search = '';
        this.showSheet = false;
        this.mode = 'add';
        this.showConfirmSave = false;
        this.pendingDeleteId = null;
        this.showConfirmDelete = false;
        this.form = { nav_id: '', entity_id: '', currency_code: '', nav_type: '' };
        // Dropdown options
        this.entityOptions = [
            { label: 'MBS Bank Ltd Singapore (MBS-SG-001)', value: 'MBS-SG-001' },
            { label: 'MBS Bank Hong Kong (MBS-HK-002)', value: 'MBS-HK-002' },
            { label: 'MBS Bank USA (MBS-US-003)', value: 'MBS-US-003' },
            { label: 'MBS Bank London (MBS-UK-004)', value: 'MBS-UK-004' }
        ];
        this.currencyOptions = [];
        this.navTypeOptions = [
            { label: 'Daily', value: 'Daily' },
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Quarterly', value: 'Quarterly' },
            { label: 'Annual', value: 'Annual' }
        ];
        this.positionTypeOptions = [
            { label: 'Opening', value: 'Opening' },
            { label: 'Closing', value: 'Closing' },
            { label: 'Average', value: 'Average' },
            { label: 'Net', value: 'Net' }
        ];
        this.sourceSystemOptions = [
            { label: 'Murex', value: 'Murex' },
            { label: 'Calypso', value: 'Calypso' },
            { label: 'SAP', value: 'SAP' },
            { label: 'Oracle', value: 'Oracle' },
            { label: 'In-House', value: 'In-House' }
        ];
        this.columnDefs = [
            { field: 'nav_id', headerName: 'NAV ID', width: 150 },
            { field: 'entity_id', headerName: 'Entity', width: 160 },
            { field: 'currency_code', headerName: 'Currency', width: 120 },
            { field: 'nav_type', headerName: 'NAV Type', width: 140 },
            { field: 'position_type', headerName: 'Position Type', width: 150 },
            { field: 'as_of_date', headerName: 'As of', width: 140 },
            { field: 'current_position', headerName: 'Current Position', width: 160, type: 'numericColumn' },
            { field: 'computed_total_nav', headerName: 'Computed NAV', width: 160, type: 'numericColumn' },
            { field: 'coi_amount', headerName: 'COI Amount', width: 140, type: 'numericColumn' },
            { field: 're_amount', headerName: 'RE Amount', width: 140, type: 'numericColumn' },
            { field: 'buffer_pct', headerName: 'Buffer %', width: 120, type: 'numericColumn' },
            { field: 'buffer_amount', headerName: 'Buffer Amount', width: 150, type: 'numericColumn' },
            { field: 'manual_overlay_amount', headerName: 'Overlay Amount', width: 160, type: 'numericColumn' },
            { field: 'optimal_car_amount', headerName: 'Optimal CAR', width: 150, type: 'numericColumn' },
            { field: 'optimal_car_as_of', headerName: 'CAR As Of', width: 150 },
            { field: 'optimal_car_source', headerName: 'CAR Source', width: 150 },
            { field: 'data_quality_status', headerName: 'DQ Status', width: 140 },
            { field: 'source_system', headerName: 'Source System', width: 150 },
            { field: 'source_batch_id', headerName: 'Batch ID', width: 140 },
            { field: 'created_at', headerName: 'Created At', width: 150 },
            { field: 'modified_at', headerName: 'Modified At', width: 150 }
        ];
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 150 };
        this.gridOptions = { pagination: true, paginationPageSize: 10, paginationPageSizeSelector: [10, 20, 50, 100], animateRows: true };
    }
    ngOnInit() {
        this.loadRows();
        this.loadCurrencyOptions();
    }
    async loadCurrencyOptions() {
        try {
            const rows = await this.currencySvc.list();
            this.currencyOptions = rows.map(r => ({ label: r.currency_code, value: r.currency_code }));
        }
        catch (e) {
            // Fallback: common currencies
            this.currencyOptions = [
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'GBP', value: 'GBP' },
                { label: 'JPY', value: 'JPY' },
                { label: 'SGD', value: 'SGD' }
            ];
            console.error('Failed to load currencies, using fallback', e);
        }
    }
    onSearchChange(v) {
        this.search = v;
        if (this.searchTimer)
            clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.loadRows(), 300);
    }
    async loadRows() {
        const data = await this.svc.list({ search: this.search || undefined });
        this.rows = data;
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
    }
    openAdd() {
        this.mode = 'add';
        this.form = {
            nav_id: '', entity_id: '', currency_code: '', nav_type: '', position_type: '', as_of_date: '',
            current_position: null, computed_total_nav: null, coi_amount: null, re_amount: null, buffer_pct: null, buffer_amount: null,
            manual_overlay_amount: null, manual_overlay_notes: '', optimal_car_amount: null, optimal_car_as_of: '', optimal_car_source: '',
            data_quality_status: '', data_quality_notes: '', source_system: '', source_batch_id: ''
        };
        this.zone.run(() => this.showSheet = true);
    }
    async editRow(row) {
        this.mode = 'edit';
        const r = await this.svc.getById(row.nav_id);
        this.form = {
            nav_id: r.nav_id,
            entity_id: r.entity_id || '',
            currency_code: r.currency_code || '',
            nav_type: r.nav_type || '',
            position_type: r.position_type || '',
            as_of_date: r.as_of_date || '',
            current_position: r.current_position ?? null,
            computed_total_nav: r.computed_total_nav ?? null,
            coi_amount: r.coi_amount ?? null,
            re_amount: r.re_amount ?? null,
            buffer_pct: r.buffer_pct ?? null,
            buffer_amount: r.buffer_amount ?? null,
            manual_overlay_amount: r.manual_overlay_amount ?? null,
            manual_overlay_notes: r.manual_overlay_notes || '',
            optimal_car_amount: r.optimal_car_amount ?? null,
            optimal_car_as_of: r.optimal_car_as_of || '',
            optimal_car_source: r.optimal_car_source || '',
            data_quality_status: r.data_quality_status || '',
            data_quality_notes: r.data_quality_notes || '',
            source_system: r.source_system || '',
            source_batch_id: r.source_batch_id || ''
        };
        this.zone.run(() => this.showSheet = true);
    }
    deleteRow(row) { this.pendingDeleteId = row.nav_id; this.showConfirmDelete = true; this.showSheet = false; }
    async confirmDelete() {
        if (!this.pendingDeleteId)
            return;
        await this.svc.deleteById(this.pendingDeleteId);
        this.showConfirmDelete = false;
        this.pendingDeleteId = null;
        await this.loadRows();
    }
    async confirmSave() {
        if (this.mode === "edit") {
            await this.svc.updateById(this.form.nav_id, this.form);
        }
        else {
            await this.svc.insert(this.form);
        }
        this.showConfirmSave = false;
        this.showSheet = false;
        this.mode = "add";
        await this.loadRows();
    }
};
PositionsNavComponent = __decorate([
    Component({
        selector: 'app-config-positions-nav',
        standalone: true,
        imports: [CommonModule, AgGridAngular, FormsModule, ButtonModule, DialogModule, DropdownModule],
        template: `
    <div class="p-6 h-full flex flex-col">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">SFX Positions</h2>
        <p class="text-gray-600">Auto-populated positions (read-only)</p>
      </div>

      <div class="filter-bar">
        <div class="filter-row w-full">
          <div class="flex items-center space-x-2">
            <label class="filter-label">Search:</label>
            <input class="filter-input w-64" placeholder="Search..." [(ngModel)]="search" (ngModelChange)="onSearchChange($event)" />
          </div>
          <div class="ml-auto" *ngIf="false">
            <button class="btn btn-primary" (click)="openAdd()"><i class="pi pi-plus"></i><span>Add</span></button>
          </div>
      </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <ag-grid-angular class="ag-theme-alpine w-full" style="height: 600px;"
          [columnDefs]="columnDefs" [rowData]="rows" [defaultColDef]="defaultColDef" [gridOptions]="gridOptions" (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>

      <!-- Delete confirm (hidden for read-only) -->
      <p-dialog *ngIf="false" header="Delete NAV" [(visible)]="showConfirmDelete" [modal]="true" [closable]="false" [style]="{width: '520px'}" styleClass="app-dialog">
        <div class="flex flex-col items-center text-center gap-2">
          <i class="pi pi-trash text-red-500 text-4xl mb-1"></i>
          <div class="text-base font-semibold text-gray-800">Delete NAV</div>
          <div class="text-sm text-gray-600">Delete <strong>{{ pendingDeleteId }}</strong>?</div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2 w-full">
            <button class="btn btn-secondary" (click)="showConfirmDelete=false"><i class="pi pi-times"></i><span>Cancel</span></button>
            <button class="btn btn-primary" (click)="confirmDelete()"><i class="pi pi-trash"></i><span>Delete</span></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Add/Edit sheet disabled in read-only mode -->
      <div *ngIf="false && showSheet" class="fixed inset-0 z-40">
        <div class="absolute inset-0 bg-black/50" (click)="showSheet=false"></div>
        <div class="absolute inset-x-0 top-[2.5vh] h-[95vh] w-[100vw] bg-white shadow-xl border border-gray-200 rounded-t-2xl overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 class="text-base font-semibold text-gray-900">{{ mode==='edit' ? 'Edit NAV' : 'Add NAV' }}</h3>
            <button class="btn btn-tertiary" (click)="showSheet=false"><i class="pi pi-times"></i></button>
          </div>
          <div class="flex-1 overflow-auto p-4 space-y-4 bg-[#F5F7F9]">
            <!-- General -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">General</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">NAV ID</label>
                      <input class="filter-input w-full" [(ngModel)]="form.nav_id" [readonly]="mode==='edit'"/>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                      <p-dropdown [options]="entityOptions" [(ngModel)]="form.entity_id" placeholder="Select entity" styleClass="filter-input w-full" [style]="{width:'100%'}"></p-dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <p-dropdown [options]="currencyOptions" [(ngModel)]="form.currency_code" placeholder="Select currency" styleClass="filter-input w-full" [style]="{width:'100%'}"></p-dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">NAV Type</label>
                      <p-dropdown [options]="navTypeOptions" [(ngModel)]="form.nav_type" placeholder="Select NAV type" styleClass="filter-input w-full" [style]="{width:'100%'}"></p-dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Position Type</label>
                      <p-dropdown [options]="positionTypeOptions" [(ngModel)]="form.position_type" placeholder="Select position type" styleClass="filter-input w-full" [style]="{width:'100%'}"></p-dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">As Of Date</label>
                      <input type="date" class="filter-input w-full" [(ngModel)]="form.as_of_date"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Positions & NAV -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Positions & NAV</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.current_position"/>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Computed Total NAV</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.computed_total_nav"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adjustments -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Adjustments</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">COI Amount</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.coi_amount"/>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">RE Amount</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.re_amount"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Buffer -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Buffer</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Buffer %</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.buffer_pct"/>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Buffer Amount</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.buffer_amount"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Manual Overlay -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Manual Overlay</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Overlay Amount</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.manual_overlay_amount"/>
                    </div>
                    <div class="field md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Overlay Notes</label>
                      <textarea rows="3" class="filter-input w-full" [(ngModel)]="form.manual_overlay_notes"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optimal CAR -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Optimal CAR</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Optimal CAR Amount</label>
                      <input type="number" step="any" class="filter-input w-full" [(ngModel)]="form.optimal_car_amount"/>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Optimal CAR As Of</label>
                      <input type="date" class="filter-input w-full" [(ngModel)]="form.optimal_car_as_of"/>
                    </div>
                    <div class="field md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Optimal CAR Source</label>
                      <input class="filter-input w-full" [(ngModel)]="form.optimal_car_source"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Quality -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Data Quality</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <input class="filter-input w-full" [(ngModel)]="form.data_quality_status"/>
                    </div>
                    <div class="field md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea rows="3" class="filter-input w-full" [(ngModel)]="form.data_quality_notes"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Source -->
            <div class="rounded-lg border border-gray-200 p-4 bg-white">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Source</div></div>
                <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Source System</label>
                      <p-dropdown [options]="sourceSystemOptions" [(ngModel)]="form.source_system" placeholder="Select source system" styleClass="filter-input w-full" [style]="{width:'100%'}"></p-dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
                      <input class="filter-input w-full" [(ngModel)]="form.source_batch_id"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-gray-200 flex justify-between items-center gap-2 bg-white">
            <button class="btn btn-secondary" (click)="showSheet=false"><i class="pi pi-times"></i><span>Cancel</span></button>
            <button class="btn btn-primary" (click)="showConfirmSave = true"><i class="pi pi-check"></i><span>Save</span></button>
          </div>
        </div>
      </div>

      <!-- Confirm Save (hidden) -->
      <p-dialog *ngIf="false" header="Confirm Changes" [(visible)]="showConfirmSave" [modal]="true" [closable]="false" [style]="{width: '520px'}" styleClass="app-dialog">
        <div class="flex flex-col items-center text-center gap-2">
          <i class="pi pi-check-circle text-green-500 text-4xl mb-1"></i>
          <div class="text-base font-semibold text-gray-800">Apply Changes</div>
          <div class="text-sm text-gray-600">Confirm updating NAV <strong>{{ form.nav_id }}</strong>.</div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2 w-full">
            <button class="btn btn-secondary" (click)="showConfirmSave=false"><i class="pi pi-times"></i><span>Cancel</span></button>
            <button class="btn btn-primary" (click)="confirmSave()"><i class="pi pi-check"></i><span>Confirm</span></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
    })
], PositionsNavComponent);
export { PositionsNavComponent };
//# sourceMappingURL=positions-nav.component.js.map