import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DealBookingsService, DealBookingRow } from './deal-bookings.service';

@Component({
  selector: 'app-operations-murex-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, DialogModule, ButtonModule],
  template: `
    <div class="p-6 h-full flex flex-col">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Murex Booking</h2>
        <p class="text-gray-600">Live from deal_bookings (Supabase)</p>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-row w-full">
          <div class="flex items-center space-x-2">
            <label class="filter-label">Search:</label>
            <input class="filter-input w-72" placeholder="deal_booking_id, references, counterparty" [(ngModel)]="search" (ngModelChange)="load()" />
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Deal Type:</label>
            <input class="filter-input w-48" [(ngModel)]="dealType" (ngModelChange)="load()" placeholder="e.g., FX Swap"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Portfolio:</label>
            <input class="filter-input w-48" [(ngModel)]="portfolio" (ngModelChange)="load()" placeholder="Code"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Trade Date:</label>
            <input type="date" class="filter-input" [(ngModel)]="tradeDate" (ngModelChange)="load()"/>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Status:</label>
            <input class="filter-input w-40" [(ngModel)]="dealStatus" (ngModelChange)="load()" placeholder="e.g., Booked"/>
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
      <p-dialog header="Deal Booking Details" [(visible)]="showDialog" [modal]="true" [style]="{width: '100vw', height: '95vh', 'max-width': '100vw', 'max-height': '95vh', 'border-top-left-radius': '16px', 'border-top-right-radius': '16px'}" styleClass="entity-dialog entity-dialog-full">
        <div class="space-y-4 p-2" *ngIf="selected">
          <!-- Identifiers -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Identifiers</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Deal Booking ID</div><div class="font-medium">{{selected.deal_booking_id}}</div></div>
                <div><div class="text-gray-500">Internal Ref</div><div class="font-medium">{{selected.internal_reference}}</div></div>
                <div><div class="text-gray-500">External Ref</div><div class="font-medium">{{selected.external_reference}}</div></div>
                <div><div class="text-gray-500">Booking Ref</div><div class="font-medium">{{selected.booking_reference}}</div></div>
              </div>
            </div>
          </div>

          <!-- Core Details -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Core Details</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Deal Type</div><div class="font-medium">{{selected.deal_type}}</div></div>
                <div><div class="text-gray-500">Product Type</div><div class="font-medium">{{selected.product_type}}</div></div>
                <div><div class="text-gray-500">Portfolio</div><div class="font-medium">{{selected.portfolio}}</div></div>
                <div><div class="text-gray-500">Counterparty</div><div class="font-medium">{{selected.counterparty}}</div></div>
                <div><div class="text-gray-500">System</div><div class="font-medium">{{selected.system}}</div></div>
                <div><div class="text-gray-500">Deal Status</div><div class="font-medium">{{selected.deal_status}}</div></div>
                <div><div class="text-gray-500">Trade Date</div><div class="font-medium">{{selected.trade_date}}</div></div>
                <div><div class="text-gray-500">Value Date</div><div class="font-medium">{{selected.value_date}}</div></div>
                <div><div class="text-gray-500">Maturity Date</div><div class="font-medium">{{selected.maturity_date}}</div></div>
              </div>
            </div>
          </div>

          <!-- Amounts & Rates -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Amounts & Rates</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><div class="text-gray-500">Sell Amount</div><div class="font-medium">{{selected.sell_amount}}</div></div>
                <div><div class="text-gray-500">Sell Currency</div><div class="font-medium">{{selected.sell_currency}}</div></div>
                <div><div class="text-gray-500">Buy Amount</div><div class="font-medium">{{selected.buy_amount}}</div></div>
                <div><div class="text-gray-500">Buy Currency</div><div class="font-medium">{{selected.buy_currency}}</div></div>
                <div><div class="text-gray-500">FX Rate</div><div class="font-medium">{{selected.fx_rate}}</div></div>
                <div><div class="text-gray-500">Swap Points</div><div class="font-medium">{{selected.swap_points}}</div></div>
              </div>
            </div>
          </div>

          <!-- Notes / Purpose -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">Notes / Purpose</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="md:col-span-2"><div class="text-gray-500">Purpose</div><div class="font-medium">{{selected.purpose}}</div></div>
                <div class="md:col-span-2"><div class="text-gray-500">Proxy Purpose</div><div class="font-medium">{{selected.proxy_purpose}}</div></div>
                <div class="md:col-span-2"><div class="text-gray-500">Comment</div><div class="font-medium">{{selected.comment1}}</div></div>
              </div>
            </div>
          </div>

          <!-- JSON Structures -->
          <div class="rounded-lg border border-gray-200 p-4 bg-white">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3"><div class="text-sm font-semibold text-gray-700">JSON Structures</div></div>
              <div class="col-span-12 md:col-span-9 grid grid-cols-1 gap-3 text-sm">
                <div><div class="text-gray-500">Near Leg</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.near_leg_structure | json}}</pre></div>
                <div><div class="text-gray-500">Far Leg</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.far_leg_structure | json}}</pre></div>
                <div><div class="text-gray-500">NDF</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.ndf_structure | json}}</pre></div>
                <div><div class="text-gray-500">Spot Details</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.spot_details | json}}</pre></div>
                <div><div class="text-gray-500">Embedded Spot</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.embedded_spot_details | json}}</pre></div>
                <div><div class="text-gray-500">Currency Pair</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.currency_pair | json}}</pre></div>
                <div><div class="text-gray-500">Currency Proxy</div><pre class="bg-gray-50 border rounded p-3 whitespace-pre-wrap">{{selected.currency_proxy | json}}</pre></div>
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
export class MurexBookingComponent implements OnInit {
  rows: DealBookingRow[] = [];
  search = '';
  dealType: string | null = null;
  portfolio: string | null = null;
  tradeDate: string | null = null;
  dealStatus: string | null = null;
  showDialog = false;
  selected: DealBookingRow | null = null;
  private gridApi: any;

  columnDefs: ColDef[] = [
    // Main column first
    { field: 'booking_reference', headerName: 'Booking Ref', width: 160 },
    // Identifiers and refs
    { field: 'internal_reference', headerName: 'Internal Ref', width: 140 },
    { field: 'external_reference', headerName: 'External Ref', width: 140 },
    { field: 'deal_booking_id', headerName: 'Deal ID', width: 160 },
    // Core attributes
    { field: 'deal_type', headerName: 'Deal Type', width: 140 },
    { field: 'product_type', headerName: 'Product Type', width: 140 },
    { field: 'portfolio', headerName: 'Portfolio', width: 140 },
    { field: 'counterparty', headerName: 'Counterparty', width: 160 },
    { field: 'system', headerName: 'System', width: 120 },
    { field: 'deal_status', headerName: 'Status', width: 120 },
    // Dates
    { field: 'trade_date', headerName: 'Trade Date', width: 130 },
    { field: 'value_date', headerName: 'Value Date', width: 130 },
    { field: 'maturity_date', headerName: 'Maturity', width: 130 },
    // Amounts and rates
    { field: 'sell_amount', headerName: 'Sell Amt', width: 120, type: 'numericColumn' },
    { field: 'sell_currency', headerName: 'Sell CCY', width: 110 },
    { field: 'buy_amount', headerName: 'Buy Amt', width: 120, type: 'numericColumn' },
    { field: 'buy_currency', headerName: 'Buy CCY', width: 110 },
    { field: 'fx_rate', headerName: 'FX Rate', width: 110 },
    { field: 'swap_points', headerName: 'Swap Pts', width: 110 },
    // Other fields requested
    { field: 'transfer_type', headerName: 'Transfer Type', width: 130 },
    { field: 'currency_pair', headerName: 'Currency Pair', width: 180, cellRenderer: (p: any) => {
      const span = document.createElement('span');
      try {
        const v = p.value;
        if (!v) { span.textContent = ''; return span; }
        // Common shapes: {base:"USD", term:"JPY"} or {pair:"USD/JPY"}
        const text = v.pair || (v.base && v.term ? `${v.base}/${v.term}` : JSON.stringify(v));
        span.textContent = text;
      } catch {
        span.textContent = String(p.value ?? '');
      }
      return span;
    }},
    { field: 'purpose', headerName: 'Purpose', width: 140 },
    // Main free text column to flex
    { field: 'comment1', headerName: 'Comment', flex: 1 },
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

  constructor(private svc: DealBookingsService) {}
  ngOnInit(){ this.load(); this.svc.subscribeRealtime(()=> this.load()); }

  async load(){
    this.rows = await this.svc.list({
      search: this.search || undefined,
      dealType: this.dealType || undefined,
      portfolio: this.portfolio || undefined,
      tradeDate: this.tradeDate || undefined,
      dealStatus: this.dealStatus || undefined
    });
    setTimeout(()=> this.gridApi?.sizeColumnsToFit(), 50);
  }
  onGridReady(e: GridReadyEvent){ this.gridApi = e.api; e.api.sizeColumnsToFit(); }
  viewRow(row: DealBookingRow){ this.selected = row; this.showDialog = true; }
  @HostListener('window:resize') onResize(){ setTimeout(()=> this.gridApi?.sizeColumnsToFit(), 100); }
}
