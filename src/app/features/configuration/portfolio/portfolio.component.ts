import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-portfolio',
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
    ChipModule,
    MultiSelectModule,
    InputNumberModule,
    TagModule
  ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  portfolios: any[] = [];
  showAddDialog = false;
  searchTerm = '';
  selectedType: any = null;
  selectedStatus: any = null;
  
  // AG Grid
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 110, sortable: true },
    { field: 'name', headerName: 'Portfolio Name', flex: 1, sortable: true },
    { field: 'type', headerName: 'Type', width: 140, sortable: true },
    { field: 'baseCurrency', headerName: 'Currency', width: 120, sortable: true },
    { field: 'totalExposure', headerName: 'Total Exposure', width: 160, type: 'numericColumn', valueFormatter: (p)=> this.formatCurrency(p.value) },
    { field: 'hedgeRatio', headerName: 'Hedge Ratio', width: 140, type: 'numericColumn', valueFormatter: (p)=> (p.value!=null? `${Number(p.value).toFixed(1)}%` : '') },
    {
      field: 'riskLevel', headerName: 'Risk Level', width: 130,
      cellRenderer: (p: any) => {
        const val = p.value || '';
        const cls = val === 'High' ? 'bg-red-100 text-red-800' : val === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
        const span = document.createElement('span');
        span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
        span.textContent = val;
        return span;
      }
    },
    {
      field: 'status', headerName: 'Status', width: 120,
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
        container.className = 'flex items-center justify-center space-x-2';
        const editBtn = document.createElement('button');
        editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
        editBtn.title = 'Edit Portfolio';
        editBtn.innerHTML = '<i class=\"pi pi-pencil\"></i>';
        editBtn.addEventListener('click', () => p.context.componentParent.editPortfolio(p.data));
        const delBtn = document.createElement('button');
        delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
        delBtn.title = 'Delete Portfolio';
        delBtn.innerHTML = '<i class=\"pi pi-trash\"></i>';
        delBtn.addEventListener('click', () => p.context.componentParent.deletePortfolio(p.data));
        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];
  defaultColDef: ColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
  gridOptions: GridOptions = { pagination: true, paginationPageSize: 20, animateRows: true, context: { componentParent: this } };
  onGridReady(e: GridReadyEvent) { e.api.sizeColumnsToFit(); }
  
  newPortfolio = {
    id: '',
    name: '',
    description: '',
    type: '',
    baseCurrency: '',
    entities: [] as any[],
    totalExposure: 0,
    hedgeRatio: 0,
    riskLevel: '',
    status: 'Active',
    lastUpdated: ''
  };

  portfolioTypes = [
    { label: 'Trading', value: 'Trading' },
    { label: 'Investment', value: 'Investment' },
    { label: 'Strategic', value: 'Strategic' },
    { label: 'Mixed', value: 'Mixed' }
  ];

  currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
    { label: 'SGD', value: 'SGD' },
    { label: 'AUD', value: 'AUD' }
  ];

  entities = [
    { label: 'MBS Bank Ltd Singapore', value: 'MBS-SG-001' },
    { label: 'MBS Bank Hong Kong', value: 'MBS-HK-002' },
    { label: 'MBS Bank USA', value: 'MBS-US-003' },
    { label: 'MBS Bank London', value: 'MBS-UK-004' }
  ];

  riskLevels = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' }
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Draft', value: 'Draft' }
  ];

  ngOnInit() {
    this.loadPortfolios();
  }

  loadPortfolios() {
    this.portfolios = [
      {
        id: 'PF001',
        name: 'Asia Pacific Trading Portfolio',
        description: 'Trading portfolio for APAC region entities',
        type: 'Trading',
        baseCurrency: 'USD',
        entities: ['MBS-SG-001', 'MBS-HK-002'],
        totalExposure: 125000000,
        hedgeRatio: 75.8,
        riskLevel: 'Medium',
        status: 'Active',
        lastUpdated: '2024-12-01'
      },
      {
        id: 'PF002',
        name: 'European Investment Portfolio',
        description: 'Long-term investment portfolio for European entities',
        type: 'Investment',
        baseCurrency: 'EUR',
        entities: ['MBS-UK-004'],
        totalExposure: 89000000,
        hedgeRatio: 85.2,
        riskLevel: 'Low',
        status: 'Active',
        lastUpdated: '2024-12-02'
      },
      {
        id: 'PF003',
        name: 'Global Strategic Holdings',
        description: 'Strategic investments across all regions',
        type: 'Strategic',
        baseCurrency: 'USD',
        entities: ['MBS-SG-001', 'MBS-HK-002', 'MBS-US-003', 'MBS-UK-004'],
        totalExposure: 250000000,
        hedgeRatio: 60.5,
        riskLevel: 'High',
        status: 'Active',
        lastUpdated: '2024-12-03'
      },
      {
        id: 'PF004',
        name: 'US Market Exposure',
        description: 'Portfolio focused on US market exposure',
        type: 'Trading',
        baseCurrency: 'USD',
        entities: ['MBS-US-003'],
        totalExposure: 75000000,
        hedgeRatio: 70.0,
        riskLevel: 'Medium',
        status: 'Active',
        lastUpdated: '2024-12-04'
      },
      {
        id: 'PF005',
        name: 'Emerging Markets Portfolio',
        description: 'High growth potential investments in emerging markets',
        type: 'Mixed',
        baseCurrency: 'USD',
        entities: [],
        totalExposure: 50000000,
        hedgeRatio: 45.3,
        riskLevel: 'High',
        status: 'Draft',
        lastUpdated: '2024-12-05'
      }
    ];
  }

  savePortfolio() {
    if (this.newPortfolio.name && this.newPortfolio.type && this.newPortfolio.baseCurrency) {
      const newPortfolioWithDetails = {
        ...this.newPortfolio,
        id: `PF${(this.portfolios.length + 1).toString().padStart(3, '0')}`,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      this.portfolios.push(newPortfolioWithDetails);
      this.resetNewPortfolio();
      this.showAddDialog = false;
    }
  }

  editPortfolio(portfolio: any) {
    console.log('Edit portfolio:', portfolio);
    // Implementation for editing would go here
  }

  deletePortfolio(portfolio: any) {
    this.portfolios = this.portfolios.filter(p => p.id !== portfolio.id);
  }

  resetNewPortfolio() {
    this.newPortfolio = {
      id: '',
      name: '',
      description: '',
      type: '',
      baseCurrency: '',
      entities: [],
      totalExposure: 0,
      hedgeRatio: 0,
      riskLevel: '',
      status: 'Active',
      lastUpdated: ''
    };
  }

  getEntityNames(entityIds: string[]): string {
    if (!entityIds || entityIds.length === 0) {
      return 'None';
    }
    
    const entityNames = entityIds.map(id => {
      const entity = this.entities.find(e => e.value === id);
      return entity ? entity.label : id;
    });
    
    return entityNames.join(', ');
  }

  getRiskLevelClass(riskLevel: string): string {
    switch(riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
