import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';
import { CurrencyService, CurrencyRow } from './currency.service';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AgGridAngular,
    InputTextModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    TooltipModule
  ],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css']
})
export class CurrencyComponent implements OnInit {
  currencies: any[] = [];
  private searchTimer: any;
  // AG Grid
  columnDefs: ColDef[] = [
    { field: 'code', headerName: 'Code', width: 110, sortable: true },
    { field: 'name', headerName: 'Name', width: 220, sortable: true },
    {
      field: 'type', headerName: 'Type', width: 180,
      cellRenderer: (p: any) => {
        const val = p.value || '';
        const cls = val === 'Matched'
          ? 'bg-blue-100 text-blue-800'
          : val === 'Mismatched'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-purple-100 text-purple-800';
        const span = document.createElement('span');
        span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
        span.textContent = val;
        return span;
      }
    },
    { field: 'baseCurrency', headerName: 'Base Currency', width: 140 },
    { field: 'settlementDays', headerName: 'Settlement Days', width: 150, type: 'numericColumn' },
    { field: 'rounding', headerName: 'Rounding', width: 120, type: 'numericColumn' },
    { field: 'effectiveDate', headerName: 'Effective Date', width: 140 },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 130 },
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: (p: any) => {
        const val = p.value || '';
        const cls = val === 'Active' ? 'bg-green-100 text-green-800' : val === 'Inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800';
        const span = document.createElement('span');
        span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
        span.textContent = val;
        return span;
      }
    },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
    {
      headerName: 'Actions', width: 140, pinned: 'right',
      cellRenderer: (p: any) => {
        const container = document.createElement('div');
        container.className = 'flex gap-2 items-center';
        const editBtn = document.createElement('button');
        editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
        editBtn.title = 'Edit';
        editBtn.innerHTML = '<i class="pi pi-pencil"></i>';
        editBtn.addEventListener('click', () => p.context.componentParent.editCurrency(p.data));
        const delBtn = document.createElement('button');
        delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
        delBtn.title = 'Delete';
        delBtn.innerHTML = '<i class="pi pi-trash"></i>';
        delBtn.addEventListener('click', () => p.context.componentParent.deleteCurrency(p.data));
        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 150 };
  gridOptions: GridOptions = { pagination: true, paginationPageSize: 10, paginationPageSizeSelector: [10, 20, 50, 100], animateRows: true, context: { componentParent: this } };

  private gridApi?: GridApi;
  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    // Optionally fit columns within the viewport (keeps minWidth)
    e.api.sizeColumnsToFit();
  }
  showAddDialog = false;
  dialogMode: 'add' | 'edit' | 'view' = 'add';
  searchTerm = '';
  selectedStatus: any = null;
  selectedType: any = null;
  
  // Form model: full schema (excluding system-managed will still be shown, but we won't send them on save)
  newCurrency: {
    code: string;
    name: string;
    type: string;
    baseCurrency: string | '';
    isDeliverable: boolean | null;
    proxyCurrency: string | '';
    settlementDays: number | null;
    rounding: number | null;
    effectiveDate: string | '';
    expiryDate: string | '';
    active: boolean | null;
    dealingCurrency: boolean | null;
    hedgeEligible: boolean | null;
    minDealSize: number | null;
    maxDealSize: number | null;
    marketStart: string | '';
    marketEnd: string | '';
    cutoff: string | '';
    exposureCurrency: string | '';
    createdBy?: string | '';
    createdDate?: string | '';
    modifiedBy?: string | '';
    modifiedDate?: string | '';
  } = {
    code: '',
    name: '',
    type: '',
    baseCurrency: '',
    isDeliverable: true,
    proxyCurrency: '',
    settlementDays: null,
    rounding: null,
    active: true,
    effectiveDate: '',
    expiryDate: '',
    dealingCurrency: true,
    hedgeEligible: true,
    minDealSize: null,
    maxDealSize: null,
    marketStart: '',
    marketEnd: '',
    cutoff: '',
    exposureCurrency: '',
    createdBy: '',
    createdDate: '',
    modifiedBy: '',
    modifiedDate: ''
  };

  currencyTypes = [
    { label: 'Matched', value: 'Matched' },
    { label: 'Mismatched', value: 'Mismatched' },
    { label: 'Mismatched with Proxy', value: 'Mismatched_with_Proxy' }
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  yesNoOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  showConfirmSave = false;
  showConfirmDelete = false;
  pendingDeleteCode: string | null = null;

  constructor(private currencySvc: CurrencyService, private zone: NgZone) {}

  ngOnInit() {
    this.loadCurrencies();
  }

  openAdd() {
    this.dialogMode = 'add';
    this.resetFormModel();
    this.zone.run(() => (this.showAddDialog = true));
  }

  async loadCurrencies() {
    const rows: CurrencyRow[] = await this.currencySvc.list({
      search: this.searchTerm || undefined,
      type: this.selectedType ?? null,
      active: this.selectedStatus === 'Active' ? true : this.selectedStatus === 'Inactive' ? false : null
    });
    this.currencies = rows.map(r => ({
      code: r.currency_code,
      name: r.currency_name,
      baseCurrency: r.base_currency || '',
      settlementDays: r.settlement_days ?? null,
      rounding: r.rounding_precision ?? null,
      effectiveDate: r.effective_date ?? '',
      expiryDate: r.expiry_date ?? '',
      type: r.currency_type,
      status: r.active_flag ? 'Active' : 'Inactive',
      lastUpdated: r.modified_date || r.created_date || ''
    }));
    // Fit columns after data load to fill available width
    setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadCurrencies(), 300);
  }

  async saveCurrency() {
    if (this.dialogMode === 'edit') {
      this.showConfirmSave = true;
      return;
    }
    this.showAddDialog = false;
  }

  async editCurrency(currency: any) {
    this.dialogMode = 'edit';
    try {
      const row = await this.currencySvc.getByCode(currency.code);
      this.newCurrency = {
        code: row.currency_code,
        name: row.currency_name,
        type: row.currency_type,
        baseCurrency: row.base_currency || '',
        isDeliverable: row.is_deliverable ?? null,
        proxyCurrency: row.proxy_currency || '',
        settlementDays: row.settlement_days ?? null,
        rounding: row.rounding_precision ?? null,
        active: row.active_flag ?? null,
        effectiveDate: row.effective_date || '',
        expiryDate: row.expiry_date || '',
        dealingCurrency: row.dealing_currency ?? null,
        hedgeEligible: row.hedge_accounting_eligible ?? null,
        minDealSize: (row.minimum_deal_size as any) ?? null,
        maxDealSize: (row.maximum_deal_size as any) ?? null,
        marketStart: row.market_hours_start || '',
        marketEnd: row.market_hours_end || '',
        cutoff: row.cut_off_time || '',
        exposureCurrency: row.exposure_currency || '',
        createdBy: row.created_by || '',
        createdDate: row.created_date || '',
        modifiedBy: row.modified_by || '',
        modifiedDate: row.modified_date || ''
      };
    } catch (e) {
      console.error('Failed to load currency row', e);
    }
    this.zone.run(() => {
      this.showAddDialog = true;
    });
  }

  deleteCurrency(currency: any) {
    // Ensure dialog opens even when event comes from outside Angular zone
    this.zone.run(() => {
      this.pendingDeleteCode = currency.code;
      this.showConfirmDelete = true;
      this.showAddDialog = false; // never show both at once
      this.dialogMode = 'add';
    });
  }

  async confirmSaveChanges() {
    if (this.dialogMode !== 'edit') { this.showConfirmSave = false; return; }
    try {
      const payload: any = {
        currency_name: this.newCurrency.name,
        currency_type: this.newCurrency.type,
        base_currency: this.newCurrency.baseCurrency || null,
        is_deliverable: this.newCurrency.isDeliverable,
        proxy_currency: this.newCurrency.proxyCurrency || null,
        settlement_days: this.newCurrency.settlementDays,
        dealing_currency: this.newCurrency.dealingCurrency,
        hedge_accounting_eligible: this.newCurrency.hedgeEligible,
        minimum_deal_size: this.newCurrency.minDealSize,
        maximum_deal_size: this.newCurrency.maxDealSize,
        rounding_precision: this.newCurrency.rounding,
        market_hours_start: this.newCurrency.marketStart || null,
        market_hours_end: this.newCurrency.marketEnd || null,
        cut_off_time: this.newCurrency.cutoff || null,
        active_flag: this.newCurrency.active,
        effective_date: this.newCurrency.effectiveDate || null,
        expiry_date: this.newCurrency.expiryDate || null
      };
      await this.currencySvc.updateByCode(this.newCurrency.code, payload);
      this.showConfirmSave = false;
      this.showAddDialog = false;
      this.dialogMode = 'add';
      this.resetFormModel();
      await this.loadCurrencies();
    } catch (e) {
      console.error('Update failed', e);
      this.showConfirmSave = false;
    }
  }

  async confirmDelete() {
    if (!this.pendingDeleteCode) { this.showConfirmDelete = false; return; }
    try {
      await this.currencySvc.deleteByCode(this.pendingDeleteCode);
      this.showConfirmDelete = false;
      this.pendingDeleteCode = null;
      await this.loadCurrencies();
    } catch (e) {
      console.error('Delete failed', e);
      this.showConfirmDelete = false;
    }
  }

  private resetFormModel() {
    this.newCurrency = {
      code: '',
      name: '',
      type: '',
      baseCurrency: '',
      isDeliverable: true,
      proxyCurrency: '',
      settlementDays: null,
      rounding: null,
      active: true,
      effectiveDate: '',
      expiryDate: '',
      dealingCurrency: true,
      hedgeEligible: true,
      minDealSize: null,
      maxDealSize: null,
      marketStart: '',
      marketEnd: '',
      cutoff: '',
      exposureCurrency: '',
      createdBy: '',
      createdDate: '',
      modifiedBy: '',
      modifiedDate: ''
    };
  }

  // No reset function for now; model initializes defaults above

  // No autosize API used to keep compatibility with current ag-grid version
}
