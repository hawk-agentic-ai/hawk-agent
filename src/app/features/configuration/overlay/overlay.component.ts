import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AgGridAngular,
    InputTextModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    TooltipModule,
    InputSwitchModule,
    CalendarModule
  ],
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent implements OnInit {
  overlays: any[] = [];
  showAddDialog = false;
  searchTerm = '';
  selectedStatus: any = null;
  selectedType: any = null;
  
  // AG Grid
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 110, sortable: true },
    { field: 'name', headerName: 'Name', flex: 1, sortable: true },
    { field: 'type', headerName: 'Type', width: 200, sortable: true },
    { field: 'effectiveDate', headerName: 'Effective Date', width: 140, valueFormatter: (p)=> this.formatDate(p.value) },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 140, valueFormatter: (p)=> this.formatDate(p.value) },
    { field: 'isAutoApplied', headerName: 'Auto Applied', width: 130, cellRenderer: (p: any)=> {
      const i = document.createElement('i');
      i.className = p.value ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-gray-400';
      return i;
    }},
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: (p: any) => {
        const val = p.value || '';
        const cls = val === 'Active' ? 'bg-green-100 text-green-800' : val === 'Inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800';
        const span = document.createElement('span');
        span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
        span.textContent = val;
        return span;
      }
    },
    {
      headerName: 'Actions', width: 120, pinned: 'right',
      cellRenderer: (p: any) => {
        const container = document.createElement('div');
        container.className = 'flex gap-2';
        const editBtn = document.createElement('button');
        editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
        editBtn.title = 'Edit overlay';
        editBtn.innerHTML = '<i class="pi pi-pencil"></i>';
        editBtn.addEventListener('click', () => p.context.componentParent.editOverlay(p.data));
        const delBtn = document.createElement('button');
        delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
        delBtn.title = 'Delete overlay';
        delBtn.innerHTML = '<i class="pi pi-trash"></i>';
        delBtn.addEventListener('click', () => p.context.componentParent.deleteOverlay(p.data));
        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];
  defaultColDef: ColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
  gridOptions: GridOptions = { pagination: true, paginationPageSize: 10, animateRows: true, context: { componentParent: this } };
  onGridReady(e: GridReadyEvent) {
    e.api.sizeColumnsToFit();
  }
  
  newOverlay = {
    id: '',
    name: '',
    description: '',
    type: '',
    effectiveDate: new Date(),
    expiryDate: null,
    isAutoApplied: false,
    status: 'Active'
  };

  overlayTypes = [
    { label: 'FX Rate Adjustment', value: 'FX Rate Adjustment' },
    { label: 'Market Value Adjustment', value: 'Market Value Adjustment' },
    { label: 'Volatility Adjustment', value: 'Volatility Adjustment' },
    { label: 'Credit Risk Adjustment', value: 'Credit Risk Adjustment' }
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Pending Approval', value: 'Pending Approval' }
  ];

  ngOnInit() {
    this.loadOverlays();
  }

  loadOverlays() {
    this.overlays = [
      {
        id: 'OVL001',
        name: 'FX Rate Smoothing Overlay',
        description: 'Adjusts FX rate volatility for emerging markets',
        type: 'FX Rate Adjustment',
        effectiveDate: new Date('2024-10-15'),
        expiryDate: new Date('2025-10-15'),
        isAutoApplied: true,
        status: 'Active'
      },
      {
        id: 'OVL002',
        name: 'Market Stress Adjustment',
        description: 'Applies market stress factor during high volatility periods',
        type: 'Market Value Adjustment',
        effectiveDate: new Date('2024-11-01'),
        expiryDate: null,
        isAutoApplied: false,
        status: 'Active'
      },
      {
        id: 'OVL003',
        name: 'Liquidity Risk Overlay',
        description: 'Adjusts for liquidity risk in thinly traded markets',
        type: 'Volatility Adjustment',
        effectiveDate: new Date('2024-09-20'),
        expiryDate: new Date('2025-03-20'),
        isAutoApplied: true,
        status: 'Active'
      },
      {
        id: 'OVL004',
        name: 'Credit Spread Adjustment',
        description: 'Adjusts for counterparty credit risk',
        type: 'Credit Risk Adjustment',
        effectiveDate: new Date('2024-12-01'),
        expiryDate: null,
        isAutoApplied: true,
        status: 'Pending Approval'
      },
      {
        id: 'OVL005',
        name: 'Legacy Market Adjustment',
        description: 'Historical market adjustment factor',
        type: 'Market Value Adjustment',
        effectiveDate: new Date('2023-06-15'),
        expiryDate: new Date('2024-06-15'),
        isAutoApplied: false,
        status: 'Inactive'
      }
    ];
  }

  saveOverlay() {
    if (this.newOverlay.name && this.newOverlay.type) {
      const newOverlayWithDetails = {
        ...this.newOverlay,
        id: `OVL${(this.overlays.length + 1).toString().padStart(3, '0')}`
      };
      this.overlays.push(newOverlayWithDetails);
      this.resetNewOverlay();
      this.showAddDialog = false;
    }
  }

  editOverlay(overlay: any) {
    console.log('Edit overlay:', overlay);
    // Implementation for editing would go here
  }

  deleteOverlay(overlay: any) {
    this.overlays = this.overlays.filter(o => o.id !== overlay.id);
  }

  resetNewOverlay() {
    this.newOverlay = {
      id: '',
      name: '',
      description: '',
      type: '',
      effectiveDate: new Date(),
      expiryDate: null,
      isAutoApplied: false,
      status: 'Active'
    };
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No Expiry';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
