import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { HedgeInstructionsService, HedgeInstruction } from './hedge-instructions.service';

@Component({
  selector: 'app-operations-hedge-instructions',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, DialogModule, ButtonModule],
  template: `
    <div class="p-6 h-full flex flex-col">
      <!-- Page Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Hedge Instructions</h2>
          <div class="text-xs text-gray-500">Live from hedge_instructions (Supabase)</div>
        </div>
        <button class="btn btn-primary" (click)="openAdd()"><i class="pi pi-plus"></i><span>Add Instruction</span></button>
      </div>

      <!-- Search Bar -->
      <div class="filter-bar">
        <div class="filter-row w-full">
          <div class="flex items-center space-x-2">
            <label class="filter-label">Search:</label>
            <input class="filter-input w-72" placeholder="msg_uid, instruction_id, status, portfolio..." [(ngModel)]="search" (ngModelChange)="load()" />
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Status:</label>
            <select class="filter-input w-48" [(ngModel)]="status" (ngModelChange)="load()">
              <option [ngValue]="null">All</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Failed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">From:</label>
            <input type="date" class="filter-input" [(ngModel)]="fromDate" (ngModelChange)="load()"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">To:</label>
            <input type="date" class="filter-input" [(ngModel)]="toDate" (ngModelChange)="load()"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Portfolio:</label>
            <input class="filter-input w-48" [(ngModel)]="portfolio" (ngModelChange)="load()" placeholder="Code"/>
          </div>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200" style="height: 600px;">
        <ag-grid-angular class="ag-theme-alpine w-full" style="width:100%; height:100%;"
          [columnDefs]="columnDefs" [rowData]="rows" [defaultColDef]="defaultColDef" [gridOptions]="gridOptions" (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>

      <!-- View Dialog -->
      <p-dialog header="Instruction Details" [(visible)]="showDialog" [modal]="true" [style]="{width: '100vw', height: '95vh', 'max-width': '100vw', 'max-height': '95vh', 'border-top-left-radius': '16px', 'border-top-right-radius': '16px'}" styleClass="entity-dialog entity-dialog-full">
        <div class="space-y-4 p-2" *ngIf="selected">
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Identifiers</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Instruction ID</div><div class="font-medium">{{selected.instruction_id}}</div></div>
                <div><div class="text-gray-500">Message UID</div><div class="font-mono">{{selected.msg_uid}}</div></div>
                <div><div class="text-gray-500">Request ID</div><div class="font-mono">{{selected.request_id}}</div></div>
                <div><div class="text-gray-500">Order ID</div><div class="font-mono">{{selected.order_id}}</div></div>
                <div><div class="text-gray-500">Sub Order ID</div><div class="font-mono">{{selected.sub_order_id}}</div></div>
                <div><div class="text-gray-500">Previous Order ID</div><div class="font-mono">{{selected.previous_order_id}}</div></div>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Status & Timestamps</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Instruction Status</div><div class="font-medium">{{selected.instruction_status}}</div></div>
                <div><div class="text-gray-500">Check Status</div><div class="font-medium">{{selected.check_status}}</div></div>
                <div><div class="text-gray-500">Ack Status</div><div class="font-medium">{{selected.acknowledgement_status}}</div></div>
                <div><div class="text-gray-500">USD PB Check</div><div class="font-medium">{{selected.usd_pb_check_status}}</div></div>
                <div><div class="text-gray-500">Instruction Date</div><div class="font-medium">{{selected.instruction_date}}</div></div>
                <div><div class="text-gray-500">Value Date</div><div class="font-medium">{{selected.value_date}}</div></div>
                <div><div class="text-gray-500">Received</div><div class="font-medium">{{selected.received_timestamp}}</div></div>
                <div><div class="text-gray-500">Processed</div><div class="font-medium">{{selected.processed_timestamp}}</div></div>
                <div><div class="text-gray-500">Response</div><div class="font-medium">{{selected.response_timestamp}}</div></div>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Amounts & Snapshot</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Hedge Amount Order</div><div class="font-medium">{{selected.hedge_amount_order}}</div></div>
                <div><div class="text-gray-500">Allocated Notional</div><div class="font-medium">{{selected.allocated_notional}}</div></div>
                <div><div class="text-gray-500">Not Allocated Notional</div><div class="font-medium">{{selected.not_allocated_notional}}</div></div>
                <div><div class="text-gray-500">Response Notional</div><div class="font-medium">{{selected.response_notional}}</div></div>
                <div><div class="text-gray-500">Buffer % Snapshot</div><div class="font-medium">{{selected.buffer_pct_snapshot}}</div></div>
                <div><div class="text-gray-500">Hedge State Snapshot</div><div class="font-medium">{{selected.hedging_state_snapshot}}</div></div>
                <div><div class="text-gray-500">CAR Exemption</div><div class="font-medium">{{selected.car_exemption_snapshot}}</div></div>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Meta</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Instruction Type</div><div class="font-medium">{{selected.instruction_type}}</div></div>
                <div><div class="text-gray-500">Exposure Currency</div><div class="font-medium">{{selected.exposure_currency}}</div></div>
                <div><div class="text-gray-500">Portfolio</div><div class="font-medium">{{selected.portfolio_code}}</div></div>
                <div><div class="text-gray-500">Framework ID Snapshot</div><div class="font-medium">{{selected.framework_id_snapshot}}</div></div>
                <div class="md:col-span-2"><div class="text-gray-500">Hedge Method</div><div class="font-medium">{{selected.hedge_method}}</div></div>
                <div class="md:col-span-2"><div class="text-gray-500">Hedging Instrument Hint</div><div class="font-medium">{{selected.hedging_instrument_hint}}</div></div>
                <div class="md:col-span-2"><div class="text-gray-500">Tenor / Maturity</div><div class="font-medium">{{selected.tenor_or_maturity}}</div></div>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Large Text</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div class="text-gray-500">Failure Reason</div>
                  <div class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.failure_reason}}</div>
                </div>
                <div>
                  <div class="text-gray-500">Instruction Fingerprint</div>
                  <div class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.instruction_fingerprint}}</div>
                </div>
                <div>
                  <div class="text-gray-500">Result</div>
                  <div class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.result}}</div>
                </div>
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

      <!-- Add/Edit Instruction Dialog -->
      <p-dialog 
        header="{{ mode === 'edit' ? 'Edit Instruction' : 'Add Instruction' }}" 
        [(visible)]="showEdit"
        [modal]="true"
        [style]="{width: '100vw', height: '95vh', 'max-width': '100vw', 'max-height': '95vh', 'border-top-left-radius': '16px', 'border-top-right-radius': '16px'}"
        [closable]="true"
        styleClass="entity-dialog entity-dialog-full">
        <form class="space-y-6 p-2">
          <!-- Basic Info -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3 flex items-center"><div class="text-sm font-semibold text-gray-700">Basic Info</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Instruction ID</label><input class="filter-input w-full" [(ngModel)]="form.instruction_id" name="instruction_id" [readonly]="mode==='edit'"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Message UID</label><input class="filter-input w-full" [(ngModel)]="form.msg_uid" name="msg_uid"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select class="filter-input w-full" [(ngModel)]="form.instruction_status" name="instruction_status">
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Failed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Portfolio</label><input class="filter-input w-full" [(ngModel)]="form.portfolio_code" name="portfolio_code"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Instruction Date</label><input type="date" class="filter-input w-full" [(ngModel)]="form.instruction_date" name="instruction_date"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Value Date</label><input type="date" class="filter-input w-full" [(ngModel)]="form.value_date" name="value_date"/></div>
              </div>
            </div>
          </div>

          <!-- Amounts & Snapshot -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3 flex items-center"><div class="text-sm font-semibold text-gray-700">Amounts & Snapshot</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Hedge Amount Order</label><input type="number" class="filter-input w-full" [(ngModel)]="form.hedge_amount_order" name="hedge_amount_order"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Allocated Notional</label><input type="number" class="filter-input w-full" [(ngModel)]="form.allocated_notional" name="allocated_notional"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Not Allocated Notional</label><input type="number" class="filter-input w-full" [(ngModel)]="form.not_allocated_notional" name="not_allocated_notional"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Response Notional</label><input type="number" class="filter-input w-full" [(ngModel)]="form.response_notional" name="response_notional"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Buffer % Snapshot</label><input type="number" class="filter-input w-full" [(ngModel)]="form.buffer_pct_snapshot" name="buffer_pct_snapshot"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Hedge State Snapshot</label><input class="filter-input w-full" [(ngModel)]="form.hedging_state_snapshot" name="hedging_state_snapshot"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">CAR Exemption</label>
                  <select class="filter-input w-full" [(ngModel)]="form.car_exemption_snapshot" name="car_exemption_snapshot">
                    <option [ngValue]="null">--</option>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3 flex items-center"><div class="text-sm font-semibold text-gray-700">Meta</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Instruction Type</label><input class="filter-input w-full" [(ngModel)]="form.instruction_type" name="instruction_type"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Exposure Currency</label><input class="filter-input w-full" [(ngModel)]="form.exposure_currency" name="exposure_currency"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Order ID</label><input class="filter-input w-full" [(ngModel)]="form.order_id" name="order_id"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Sub Order ID</label><input class="filter-input w-full" [(ngModel)]="form.sub_order_id" name="sub_order_id"/></div>
                <div class="field"><label class="block text-sm font-medium text-gray-700 mb-1">Previous Order ID</label><input class="filter-input w-full" [(ngModel)]="form.previous_order_id" name="previous_order_id"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Hedge Method</label><input class="filter-input w-full" [(ngModel)]="form.hedge_method" name="hedge_method"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Hedging Instrument Hint</label><input class="filter-input w-full" [(ngModel)]="form.hedging_instrument_hint" name="hedging_instrument_hint"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Tenor / Maturity</label><input class="filter-input w-full" [(ngModel)]="form.tenor_or_maturity" name="tenor_or_maturity"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Framework ID Snapshot</label><input class="filter-input w-full" [(ngModel)]="form.framework_id_snapshot" name="framework_id_snapshot"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Request ID</label><input class="filter-input w-full" [(ngModel)]="form.request_id" name="request_id"/></div>
                <div class="field md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">External Trade ID</label><input class="filter-input w-full" [(ngModel)]="form.external_trade_id" name="external_trade_id"/></div>
              </div>
            </div>
          </div>

          <!-- Large Text -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3 flex items-center"><div class="text-sm font-semibold text-gray-700">Large Text</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 gap-3">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Failure Reason</label><textarea rows="2" class="filter-input w-full" [(ngModel)]="form.failure_reason" name="failure_reason"></textarea></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Instruction Fingerprint</label><textarea rows="2" class="filter-input w-full" [(ngModel)]="form.instruction_fingerprint" name="instruction_fingerprint"></textarea></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Result</label><textarea rows="3" class="filter-input w-full" [(ngModel)]="form.result" name="result"></textarea></div>
              </div>
            </div>
          </div>
        </form>
        <ng-template pTemplate="footer">
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button class="btn btn-secondary" (click)="showEdit=false">Cancel</button>
            <button class="btn btn-primary" (click)="confirmSave()">{{ mode==='edit' ? 'Update' : 'Save' }}</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class HedgeInstructionsComponent implements OnInit, OnDestroy {
  rows: HedgeInstruction[] = [];
  search = '';
  showDialog = false;
  selected: HedgeInstruction | null = null;
  // Filters
  status: string | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  portfolio: string | null = null;
  // Add/Edit
  showEdit = false;
  mode: 'add' | 'edit' = 'add';
  form: Partial<HedgeInstruction> = {};
  pendingDeleteId: string | null = null;
  showConfirmDelete = false;

  private gridApi: any;
  columnDefs: ColDef[] = [
    { field: 'instruction_id', headerName: 'Instruction ID', width: 160 },
    { field: 'msg_uid', headerName: 'Message UID', width: 200 },
    { field: 'instruction_status', headerName: 'Status', width: 140 },
    { field: 'portfolio_code', headerName: 'Portfolio', width: 140 },
    { field: 'exposure_currency', headerName: 'Currency', width: 100 },
    { field: 'instruction_date', headerName: 'Instruction Date', width: 140 },
    { field: 'value_date', headerName: 'Value Date', width: 120 },
    { field: 'allocated_notional', headerName: 'Allocated', width: 140, type: 'numericColumn' },
    { field: 'not_allocated_notional', headerName: 'Not Allocated', width: 150, type: 'numericColumn' },
    { field: 'response_notional', headerName: 'Response Notional', width: 160, type: 'numericColumn' },
    { field: 'hedging_state_snapshot', headerName: 'Hedge State', width: 140 },
    { field: 'buffer_pct_snapshot', headerName: 'Buffer %', width: 110 },
    { field: 'order_id', headerName: 'Order ID', width: 140 },
    { field: 'sub_order_id', headerName: 'Sub Order', width: 140 },
    { field: 'failure_reason', headerName: 'Failure Reason', flex: 1 },
    { headerName: 'Actions', width: 100, pinned: 'right', cellRenderer: (p: any)=> {
      const btn = document.createElement('button');
      btn.className = 'text-gray-500 hover:text-blue-600 p-1';
      btn.title = 'View Details';
      btn.innerHTML = '<i class="pi pi-eye"></i>';
      btn.addEventListener('click', () => p.context.componentParent.viewRow(p.data));
      return btn;
    }}
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
  gridOptions: GridOptions = { pagination: true, paginationPageSize: 25, animateRows: true, context: { componentParent: this } };

  constructor(private svc: HedgeInstructionsService) {}

  ngOnInit() { this.load(); this.svc.subscribeRealtime(() => this.load()); }
  ngOnDestroy() {}

  async load() {
    this.rows = await this.svc.list({ 
      search: this.search || undefined,
      status: this.status || undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      portfolio: this.portfolio || undefined
    });
    setTimeout(() => this.gridApi?.sizeColumnsToFit(), 50);
  }

  onGridReady(e: GridReadyEvent) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }

  viewRow(row: HedgeInstruction) { this.selected = row; this.showDialog = true; }

  @HostListener('window:resize')
  onResize() { setTimeout(() => this.gridApi?.sizeColumnsToFit(), 100); }

  openAdd() {
    this.mode = 'add';
    this.form = { instruction_status: 'Pending' };
    this.showEdit = true;
  }

  editRow(row: HedgeInstruction) {
    this.mode = 'edit';
    this.form = { ...row };
    this.showEdit = true;
  }

  async confirmSave() {
    if (this.mode === 'edit' && this.form.instruction_id) {
      await this.svc.updateById(this.form.instruction_id, this.form);
    } else {
      await this.svc.add(this.form);
    }
    this.showEdit = false;
    this.mode = 'add';
    this.form = {};
    await this.load();
  }

  deleteRow(row: HedgeInstruction) { this.pendingDeleteId = row.instruction_id || null; this.showConfirmDelete = true; }
  async confirmDelete() {
    if (!this.pendingDeleteId) return;
    await this.svc.deleteById(this.pendingDeleteId);
    this.showConfirmDelete = false;
    this.pendingDeleteId = null;
    await this.load();
  }
}
