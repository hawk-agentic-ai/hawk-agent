import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
// Remove duplicate code outside the class
let EntityComponent = class EntityComponent {
    constructor(ngZone, entityMasterService, currencyService) {
        this.ngZone = ngZone;
        this.entityMasterService = entityMasterService;
        this.currencyService = currencyService;
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
        this.entities = [];
        this.search = '';
        this.showSheet = false;
        this.mode = 'add';
        this.showConfirmSave = false;
        this.pendingDeleteId = null;
        this.showConfirmDelete = false;
        this.form = {
            inception_date: '',
            modified_date: '',
            termination_date: '',
            parent_child_nav_link: false,
            created_date: '',
            car_exemption_flag: '',
            legal_entity_code: '',
            business_unit: '',
            country_code: '',
            region: '',
            active_flag: '',
            regulatory_classification: '',
            risk_weight_category: '',
            created_by: '',
            modified_by: '',
            murex_issuer: '',
            murex_comment: '',
            entity_id: '',
            comments: '',
            entity_name: '',
            entity_type: '',
            parent_entity_id: '',
            currency_code: ''
        };
        this.entityTypes = [
            { label: 'Branch', value: 'Branch' },
            { label: 'Subsidiary', value: 'Subsidiary' },
            { label: 'Association', value: 'Association' },
            { label: 'TMU', value: 'TMU' }
        ];
        this.countries = [
            { label: 'Singapore', value: 'Singapore' },
            { label: 'Hong Kong', value: 'Hong Kong' },
            { label: 'United States', value: 'United States' },
            { label: 'United Kingdom', value: 'United Kingdom' },
            { label: 'Japan', value: 'Japan' },
            { label: 'Australia', value: 'Australia' }
        ];
        this.currencies = [];
        this.columnDefs = [
            { field: 'legal_entity_code', headerName: 'Entity Code', minWidth: 160, sortable: true },
            { field: 'entity_name', headerName: 'Entity Name', flex: 1, sortable: true },
            { field: 'entity_type', headerName: 'Type', width: 140, sortable: true },
            { field: 'business_unit', headerName: 'Business Unit', width: 140, sortable: true },
            { field: 'country_code', headerName: 'Country', width: 120, sortable: true },
            { field: 'region', headerName: 'Region', width: 120, sortable: true },
            { field: 'currency_code', headerName: 'Currency', width: 100, sortable: true, cellClass: 'text-center' },
            { field: 'active_flag', headerName: 'Status', width: 100, cellRenderer: (p) => {
                    const val = p.value === 'Y' ? 'Active' : 'Inactive';
                    const cls = val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    const span = document.createElement('span');
                    span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
                    span.textContent = val;
                    return span;
                } },
            { field: 'inception_date', headerName: 'Inception Date', width: 140, sortable: true },
            { field: 'termination_date', headerName: 'Termination Date', width: 140, sortable: true },
            { field: 'created_date', headerName: 'Created Date', width: 140, sortable: true },
            { field: 'modified_date', headerName: 'Modified Date', width: 140, sortable: true },
            { field: 'created_by', headerName: 'Created By', width: 120, sortable: true },
            { field: 'modified_by', headerName: 'Modified By', width: 120, sortable: true },
            { field: 'parent_entity_id', headerName: 'Parent Entity', width: 120, sortable: true },
            { field: 'parent_child_nav_link', headerName: 'Parent-Child NAV Link', width: 120, sortable: true },
            { field: 'car_exemption_flag', headerName: 'CAR Exemption', width: 120, sortable: true },
            { field: 'regulatory_classification', headerName: 'Regulatory Classification', width: 160, sortable: true },
            { field: 'risk_weight_category', headerName: 'Risk Weight Category', width: 160, sortable: true },
            { field: 'murex_issuer', headerName: 'Murex Issuer', width: 120, sortable: true },
            { field: 'murex_comment', headerName: 'Murex Comment', width: 160, sortable: true },
            { field: 'comments', headerName: 'Comments', width: 160, sortable: true },
            { headerName: 'Actions', width: 120, pinned: 'right', cellRenderer: (p) => {
                    const container = document.createElement('div');
                    container.className = 'flex items-center justify-center space-x-2';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
                    editBtn.title = 'Edit Entity';
                    editBtn.innerHTML = '<i class="pi pi-pencil text-sm"></i>';
                    editBtn.addEventListener('click', () => p.context.componentParent.editRow(p.data));
                    const delBtn = document.createElement('button');
                    delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
                    delBtn.title = 'Delete Entity';
                    delBtn.innerHTML = '<i class="pi pi-trash text-sm"></i>';
                    delBtn.addEventListener('click', () => p.context.componentParent.deleteRow(p.data));
                    container.appendChild(editBtn);
                    container.appendChild(delBtn);
                    return container;
                } }
        ];
        this.gridOptions = { pagination: true, paginationPageSize: 20, animateRows: true, context: { componentParent: this } };
    }
    async fetchCurrencies() {
        const rows = await this.currencyService.list();
        this.currencies = rows.map((r) => ({ label: r.currency_code, value: r.currency_code }));
    }
    ngOnInit() {
        this.entitySub = this.entityMasterService.entities$.subscribe(data => {
            this.entities = data;
            setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
        });
        this.fetchCurrencies();
    }
    ngOnDestroy() {
        if (this.entitySub)
            this.entitySub.unsubscribe();
    }
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    onSearchChange(v) {
        this.search = v;
        if (this.searchTimer)
            clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.applyFilters(), 300);
    }
    applyFilters() {
        let filtered = this.entities;
        if (this.search.trim()) {
            const s = this.search.trim().toLowerCase();
            filtered = filtered.filter(e => (e.legal_entity_code?.toLowerCase().includes(s) ||
                e.entity_name?.toLowerCase().includes(s) ||
                e.entity_type?.toLowerCase().includes(s) ||
                e.country_code?.toLowerCase().includes(s) ||
                e.currency_code?.toLowerCase().includes(s)));
        }
        this.gridApi?.setRowData(filtered);
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
    }
    openAdd() {
        this.mode = 'add';
        this.form = {};
        this.ngZone.run(() => this.showSheet = true);
    }
    async editRow(row) {
        this.mode = 'edit';
        this.form = { ...row };
        this.ngZone.run(() => this.showSheet = true);
    }
    deleteRow(row) { this.pendingDeleteId = row.entity_id; this.showConfirmDelete = true; this.showSheet = false; }
    async confirmDelete() {
        if (!this.pendingDeleteId)
            return;
        await this.entityMasterService.deleteEntity(this.pendingDeleteId);
        this.showConfirmDelete = false;
        this.pendingDeleteId = null;
    }
    async confirmSave() {
        if (this.mode === 'edit' && this.form.entity_id) {
            await this.entityMasterService.updateEntity(this.form.entity_id, this.form);
        }
        else {
            await this.entityMasterService.addEntity(this.form);
        }
        this.showConfirmSave = false;
        this.showSheet = false;
        this.mode = 'add';
        this.form = {};
    }
};
EntityComponent = __decorate([
    Component({
        selector: 'app-entity',
        standalone: true,
        imports: [
            CommonModule,
            ButtonModule,
            AgGridAngular,
            InputTextModule,
            DropdownModule,
            DialogModule,
            FormsModule
        ],
        templateUrl: './entity.component.html',
        styleUrls: ['./entity.component.scss']
    })
], EntityComponent);
export { EntityComponent };
//# sourceMappingURL=entity.component.js.map