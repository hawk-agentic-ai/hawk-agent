import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { PositionsService } from '../../../shared/services/positions.service';

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="p-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">SFX Positions</h2>
        <p class="text-gray-600">View and manage hedge accounting positions by entity and currency</p>
      </div>

      <!-- Filters Section: standardized with .filter-* styles -->
      <div class="filter-bar">
        <div class="filter-row w-full">
          <div class="flex items-center space-x-2">
            <label class="filter-label">Entity Type:</label>
            <select class="filter-input w-48">
              <option value="">All</option>
              <option value="subsidiary">Subsidiary</option>
              <option value="branch">Branch</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="filter-label">Currency:</label>
            <select class="filter-input w-40">
              <option value="">All</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
          <div class="ml-auto">
            <button class="btn btn-primary">
              <i class="pi pi-filter"></i>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <ag-grid-angular
          class="ag-theme-alpine w-full"
          style="height: 600px;"
          [columnDefs]="columnDefs"
          [rowData]="rowData"
          [gridOptions]="gridOptions"
          [defaultColDef]="defaultColDef"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>
    </div>
  `
})
export class PositionsComponent implements OnInit {
  rowData: any[] = [];
  
  columnDefs: ColDef[] = [
    { 
      field: 'entityType', 
      headerName: 'Entity Type', 
      width: 150
    },
    { 
      field: 'entityName', 
      headerName: 'Entity Name', 
      width: 200
    },
    { 
      field: 'navType', 
      headerName: 'NAV Type', 
      width: 120,
      filter: 'agSetColumnFilter'
    },
    { 
      field: 'functionalCurrency', 
      headerName: 'Functional Currency', 
      width: 150,
      filter: 'agSetColumnFilter'
    },
    { 
      field: 'originalValue', 
      headerName: 'Original Value', 
      width: 150,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: params.data.functionalCurrency || 'USD'
        }).format(params.value);
      }
    },
    { 
      field: 'hedgedAmount', 
      headerName: 'Hedged Amount', 
      width: 150,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: params.data.functionalCurrency || 'USD'
        }).format(params.value);
      }
    },
    { 
      field: 'unhedgedAmount', 
      headerName: 'Unhedged Amount', 
      width: 150,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: params.data.functionalCurrency || 'USD'
        }).format(params.value);
      }
    },
    { 
      field: 'lastUpdated', 
      headerName: 'Last Updated', 
      width: 150,
      cellRenderer: (params: any) => {
        return new Date(params.value).toLocaleDateString();
      }
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    flex: 1,
    minWidth: 100
  };

  // Grouping removed for community edition

  gridOptions: GridOptions = {
    animateRows: true,
    cellSelection: true,
    rowSelection: { mode: 'multiRow' },
    pagination: true,
    paginationPageSize: 20
  };

  constructor(private positionsService: PositionsService) {}

  ngOnInit() {
    this.loadPositions();
  }

  loadPositions() {
    this.positionsService.getPositions().subscribe({
      next: (data) => {
        this.rowData = data;
      },
      error: (error) => {
        console.error('Error loading positions:', error);
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
