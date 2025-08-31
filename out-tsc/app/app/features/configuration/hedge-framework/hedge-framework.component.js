import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
let HedgeFrameworkComponent = class HedgeFrameworkComponent {
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    constructor(svc, zone) {
        this.svc = svc;
        this.zone = zone;
        this.frameworks = [];
        this.showSheet = false;
        this.dialogMode = 'add';
        this.showConfirmSave = false;
        this.showConfirmDelete = false;
        this.pendingDeleteId = null;
        this.searchTerm = '';
        this.selectedType = null;
        this.selectedStatus = null;
        // AG Grid
        this.columnDefs = [
            { field: 'framework_id', headerName: 'Framework ID', width: 150, sortable: true },
            { field: 'framework_type', headerName: 'Framework Type', width: 160, sortable: true },
            { field: 'hedging_state', headerName: 'Hedging State', width: 150 },
            { field: 'entity_id', headerName: 'Entity ID', width: 160 },
            { field: 'currency_code', headerName: 'Currency', width: 120 },
            { field: 'hedge_ratio', headerName: 'Hedge Ratio', width: 140, type: 'numericColumn' },
            { field: 'effectiveness_threshold_lower', headerName: 'Eff. Lower', width: 130, type: 'numericColumn' },
            { field: 'effectiveness_threshold_upper', headerName: 'Eff. Upper', width: 130, type: 'numericColumn' },
            { field: 'minimum_hedge_amount', headerName: 'Min Hedge', width: 140, type: 'numericColumn' },
            { field: 'maximum_hedge_amount', headerName: 'Max Hedge', width: 140, type: 'numericColumn' },
            { field: 'buffer_percentage', headerName: 'Buffer %', width: 120, type: 'numericColumn' },
            { field: 'accounting_method', headerName: 'Accounting Method', width: 180 },
            { field: 'rebalancing_frequency', headerName: 'Rebalancing Freq', width: 170 },
            { field: 'car_exemption_override', headerName: 'CAR Exemption', width: 150 },
            { field: 'active_flag', headerName: 'Active', width: 110 },
            { field: 'effective_date', headerName: 'Effective Date', width: 140 },
            { field: 'expiry_date', headerName: 'Expiry Date', width: 140 },
            { field: 'period', headerName: 'Period', width: 160 },
            { field: 'notes', headerName: 'Notes', width: 220, cellRenderer: (p) => { const d = document.createElement('div'); d.title = p.value || ''; d.textContent = (p.value || ''); return d; } },
            { field: 'created_by', headerName: 'Created By', width: 130 },
            { field: 'created_date', headerName: 'Created Date', width: 150 },
            { field: 'modified_by', headerName: 'Modified By', width: 130 },
            { field: 'modified_date', headerName: 'Modified Date', width: 150 },
            { headerName: 'Actions', width: 120, pinned: 'right', cellRenderer: (p) => {
                    const container = document.createElement('div');
                    container.className = 'flex gap-2';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
                    editBtn.title = 'Edit framework';
                    editBtn.innerHTML = '<i class="pi pi-pencil"></i>';
                    editBtn.addEventListener('click', () => p.context.componentParent.editFramework(p.data));
                    const delBtn = document.createElement('button');
                    delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
                    delBtn.title = 'Delete framework';
                    delBtn.innerHTML = '<i class="pi pi-trash"></i>';
                    delBtn.addEventListener('click', () => p.context.componentParent.deleteFramework(p.data));
                    container.appendChild(editBtn);
                    container.appendChild(delBtn);
                    return container;
                } }
        ];
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 150 };
        this.gridOptions = { pagination: true, paginationPageSize: 10, paginationPageSizeSelector: [10, 20, 50, 100], animateRows: true, context: { componentParent: this } };
        // Form model for sheet
        this.framework = {
            framework_id: '',
            framework_type: '',
            hedging_state: '',
            currency_code: '',
            entity_id: '',
            hedge_ratio: null,
            effectiveness_threshold_lower: null,
            effectiveness_threshold_upper: null,
            minimum_hedge_amount: null,
            maximum_hedge_amount: null,
            buffer_percentage: null,
            accounting_method: '',
            rebalancing_frequency: '',
            car_exemption_override: '',
            notes: '',
            active_flag: 'Y',
            effective_date: '',
            expiry_date: '',
            period: '',
            created_by: '',
            created_date: '',
            modified_by: '',
            modified_date: ''
        };
        this.frameworkTypes = [
            { label: 'Cash Flow Hedge', value: 'Cash Flow Hedge' },
            { label: 'Fair Value Hedge', value: 'Fair Value Hedge' },
            { label: 'Net Investment Hedge', value: 'Net Investment Hedge' }
        ];
        this.applicationTypes = [
            { label: 'FX Risk', value: 'FX Risk' },
            { label: 'Interest Rate Risk', value: 'Interest Rate Risk' },
            { label: 'Commodity Risk', value: 'Commodity Risk' },
            { label: 'Multiple Risks', value: 'Multiple Risks' }
        ];
        this.statusOptions = [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Draft', value: 'Draft' }
        ];
    }
    ngOnInit() { this.loadFrameworks(); }
    async loadFrameworks() {
        const rows = await this.svc.list({
            search: this.searchTerm || undefined,
            type: this.selectedType ?? null,
            active: this.selectedStatus ?? null
        });
        this.frameworks = rows;
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
    }
    openAdd() { this.dialogMode = 'add'; this.resetForm(); this.zone.run(() => this.showSheet = true); }
    async editFramework(row) {
        this.dialogMode = 'edit';
        const r = await this.svc.getById(row.framework_id);
        this.framework = {
            framework_id: r.framework_id,
            framework_type: r.framework_type || '',
            hedging_state: r.hedging_state || '',
            currency_code: r.currency_code || '',
            entity_id: r.entity_id || '',
            hedge_ratio: r.hedge_ratio,
            effectiveness_threshold_lower: r.effectiveness_threshold_lower,
            effectiveness_threshold_upper: r.effectiveness_threshold_upper,
            minimum_hedge_amount: r.minimum_hedge_amount,
            maximum_hedge_amount: r.maximum_hedge_amount,
            buffer_percentage: r.buffer_percentage,
            accounting_method: r.accounting_method || '',
            rebalancing_frequency: r.rebalancing_frequency || '',
            car_exemption_override: r.car_exemption_override || '',
            notes: r.notes || '',
            active_flag: r.active_flag || 'Y',
            effective_date: r.effective_date || '',
            expiry_date: r.expiry_date || '',
            period: r.period || '',
            created_by: r.created_by || '',
            created_date: r.created_date || '',
            modified_by: r.modified_by || '',
            modified_date: r.modified_date || ''
        };
        this.zone.run(() => this.showSheet = true);
    }
    deleteFramework(row) { this.pendingDeleteId = row.framework_id; this.showConfirmDelete = true; this.showSheet = false; }
    async confirmSave() {
        const p = { ...this.framework };
        if (this.dialogMode === 'edit') {
            await this.svc.updateById(this.framework.framework_id, p);
        }
        else {
            // For add, require an ID and insert
            await this.svc.insert(p);
        }
        this.showConfirmSave = false;
        this.showSheet = false;
        this.dialogMode = 'add';
        this.resetForm();
        await this.loadFrameworks();
    }
    async confirmDelete() { if (!this.pendingDeleteId)
        return; await this.svc.deleteById(this.pendingDeleteId); this.showConfirmDelete = false; this.pendingDeleteId = null; await this.loadFrameworks(); }
    resetForm() {
        this.framework = { framework_id: '', framework_type: '', hedging_state: '', currency_code: '', entity_id: '', hedge_ratio: null, effectiveness_threshold_lower: null, effectiveness_threshold_upper: null, minimum_hedge_amount: null, maximum_hedge_amount: null, buffer_percentage: null, accounting_method: '', rebalancing_frequency: '', car_exemption_override: '', notes: '', active_flag: 'Y', effective_date: '', expiry_date: '', period: '', created_by: '', created_date: '', modified_by: '', modified_date: '' };
    }
};
HedgeFrameworkComponent = __decorate([
    Component({
        selector: 'app-hedge-framework',
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
        templateUrl: './hedge-framework.component.html',
        styleUrls: ['./hedge-framework.component.css']
    })
], HedgeFrameworkComponent);
export { HedgeFrameworkComponent };
//# sourceMappingURL=hedge-framework.component.js.map