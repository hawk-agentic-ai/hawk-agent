import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-picklist',
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
  templateUrl: './picklist.component.html',
  styleUrls: ['./picklist.component.css']
})
export class PicklistComponent implements OnInit {
  picklists: any[] = [];
  showAddDialog = false;
  searchTerm = '';
  selectedCategory: any = null;
  selectedStatus: any = null;
  
  // AG Grid
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 110, sortable: true },
    { field: 'name', headerName: 'Name', flex: 1, sortable: true },
    { field: 'code', headerName: 'Code', width: 150, cellRenderer: (p: any)=> {
      const code = document.createElement('code');
      code.className = 'bg-gray-100 px-2 py-1 rounded text-gray-800';
      code.textContent = p.value;
      return code; }
    },
    { field: 'category', headerName: 'Category', width: 180, sortable: true },
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: (p: any)=> {
      const val = p.value || '';
      const cls = val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
      const span = document.createElement('span');
      span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
      span.textContent = val;
      return span; }
    },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
    { headerName: 'Actions', width: 120, pinned: 'right', cellRenderer: (p: any)=> {
      const container = document.createElement('div');
      container.className = 'flex gap-2';
      const editBtn = document.createElement('button');
      editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '<i class="pi pi-pencil"></i>';
      editBtn.addEventListener('click', () => p.context.componentParent.editPicklistItem(p.data));
      const delBtn = document.createElement('button');
      delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '<i class="pi pi-trash"></i>';
      delBtn.addEventListener('click', () => p.context.componentParent.deletePicklistItem(p.data));
      container.appendChild(editBtn);
      container.appendChild(delBtn);
      return container; }
    }
  ];
  defaultColDef: ColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
  gridOptions: GridOptions = { pagination: true, paginationPageSize: 10, animateRows: true, context: { componentParent: this } };
  onGridReady(e: GridReadyEvent) { e.api.sizeColumnsToFit(); }
  
  newPicklistItem = {
    id: '',
    name: '',
    code: '',
    category: '',
    description: '',
    status: 'Active',
    lastUpdated: ''
  };

  categories = [
    { label: 'Risk Types', value: 'Risk Types' },
    { label: 'Hedge Types', value: 'Hedge Types' },
    { label: 'Portfolio Types', value: 'Portfolio Types' },
    { label: 'Accounting Standards', value: 'Accounting Standards' },
    { label: 'Designation Types', value: 'Designation Types' }
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  ngOnInit() {
    this.loadPicklists();
  }

  loadPicklists() {
    this.picklists = [
      {
        id: 'PK001',
        name: 'Foreign Exchange Risk',
        code: 'FX_RISK',
        category: 'Risk Types',
        description: 'Risk associated with changes in foreign exchange rates',
        status: 'Active',
        lastUpdated: '2024-12-01'
      },
      {
        id: 'PK002',
        name: 'Interest Rate Risk',
        code: 'IR_RISK',
        category: 'Risk Types',
        description: 'Risk associated with changes in interest rates',
        status: 'Active',
        lastUpdated: '2024-12-01'
      },
      {
        id: 'PK003',
        name: 'Fair Value Hedge',
        code: 'FV_HEDGE',
        category: 'Hedge Types',
        description: 'Hedge against changes in fair value of an asset or liability',
        status: 'Active',
        lastUpdated: '2024-12-02'
      },
      {
        id: 'PK004',
        name: 'Cash Flow Hedge',
        code: 'CF_HEDGE',
        category: 'Hedge Types',
        description: 'Hedge against variability in cash flows',
        status: 'Active',
        lastUpdated: '2024-12-02'
      },
      {
        id: 'PK005',
        name: 'Net Investment Hedge',
        code: 'NI_HEDGE',
        category: 'Hedge Types',
        description: 'Hedge of the foreign currency exposure of a net investment in a foreign operation',
        status: 'Active',
        lastUpdated: '2024-12-02'
      },
      {
        id: 'PK006',
        name: 'Trading Portfolio',
        code: 'TRADING',
        category: 'Portfolio Types',
        description: 'Portfolio of assets held for trading purposes',
        status: 'Active',
        lastUpdated: '2024-12-03'
      },
      {
        id: 'PK007',
        name: 'Investment Portfolio',
        code: 'INVESTMENT',
        category: 'Portfolio Types',
        description: 'Portfolio of assets held for investment purposes',
        status: 'Active',
        lastUpdated: '2024-12-03'
      },
      {
        id: 'PK008',
        name: 'IFRS 9',
        code: 'IFRS9',
        category: 'Accounting Standards',
        description: 'International Financial Reporting Standard 9',
        status: 'Active',
        lastUpdated: '2024-12-04'
      },
      {
        id: 'PK009',
        name: 'US GAAP ASC 815',
        code: 'ASC815',
        category: 'Accounting Standards',
        description: 'US GAAP Accounting Standards Codification Topic 815',
        status: 'Active',
        lastUpdated: '2024-12-04'
      },
      {
        id: 'PK010',
        name: 'Micro Hedge',
        code: 'MICRO',
        category: 'Designation Types',
        description: 'One-to-one hedging relationship',
        status: 'Active',
        lastUpdated: '2024-12-05'
      },
      {
        id: 'PK011',
        name: 'Macro Hedge',
        code: 'MACRO',
        category: 'Designation Types',
        description: 'Hedging a group of items with similar risk characteristics',
        status: 'Inactive',
        lastUpdated: '2024-12-05'
      }
    ];
  }

  savePicklistItem() {
    if (this.newPicklistItem.name && this.newPicklistItem.code && this.newPicklistItem.category) {
      const newItemWithDetails = {
        ...this.newPicklistItem,
        id: `PK${(this.picklists.length + 1).toString().padStart(3, '0')}`,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      this.picklists.push(newItemWithDetails);
      this.resetNewPicklistItem();
      this.showAddDialog = false;
    }
  }

  editPicklistItem(item: any) {
    console.log('Edit picklist item:', item);
    // Implementation for editing would go here
  }

  deletePicklistItem(item: any) {
    this.picklists = this.picklists.filter(p => p.id !== item.id);
  }

  resetNewPicklistItem() {
    this.newPicklistItem = {
      id: '',
      name: '',
      code: '',
      category: '',
      description: '',
      status: 'Active',
      lastUpdated: ''
    };
  }
}
