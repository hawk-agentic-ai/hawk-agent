import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
let ThresholdConfigurationComponent = class ThresholdConfigurationComponent {
    constructor(ngZone, thresholdService) {
        this.ngZone = ngZone;
        this.thresholdService = thresholdService;
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
        this.thresholds = [];
        this.search = '';
        this.showSheet = false;
        this.mode = 'add';
        this.pendingDeleteId = null;
        this.showConfirmDelete = false;
        this.form = {
            breach_tolerance_minutes: 0,
            warning_level: 0,
            effective_date: '',
            expiry_date: '',
            critical_level: 0,
            created_date: '',
            maximum_limit: 0,
            modified_date: '',
            automated_action_flag: '',
            notification_emails: '',
            active_flag: '',
            created_by: '',
            modified_by: '',
            escalation_level_3: '',
            threshold_type: '',
            currency_code: '',
            entity_type: '',
            unit_of_measure: '',
            escalation_level_1: '',
            escalation_level_2: '',
            threshold_id: ''
        };
        this.columnDefs = [
            { field: 'threshold_id', headerName: 'Threshold ID', minWidth: 160, sortable: true },
            { field: 'threshold_type', headerName: 'Type', width: 140, sortable: true },
            { field: 'currency_code', headerName: 'Currency', width: 100, sortable: true },
            { field: 'entity_type', headerName: 'Entity Type', width: 140, sortable: true },
            { field: 'unit_of_measure', headerName: 'Unit', width: 120, sortable: true },
            { field: 'maximum_limit', headerName: 'Max Limit', width: 120, sortable: true },
            { field: 'warning_level', headerName: 'Warning', width: 100, sortable: true },
            { field: 'critical_level', headerName: 'Critical', width: 100, sortable: true },
            { field: 'breach_tolerance_minutes', headerName: 'Tolerance (min)', width: 120, sortable: true },
            { field: 'automated_action_flag', headerName: 'Automated', width: 100, cellRenderer: (p) => {
                    const val = p.value === 'Y' ? 'Yes' : 'No';
                    const cls = val === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                    const span = document.createElement('span');
                    span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
                    span.textContent = val;
                    return span;
                } },
            { field: 'active_flag', headerName: 'Status', width: 100, cellRenderer: (p) => {
                    const val = p.value === 'Y' ? 'Active' : 'Inactive';
                    const cls = val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    const span = document.createElement('span');
                    span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
                    span.textContent = val;
                    return span;
                } },
            { field: 'effective_date', headerName: 'Effective Date', width: 140, sortable: true },
            { field: 'expiry_date', headerName: 'Expiry Date', width: 140, sortable: true },
            { field: 'created_date', headerName: 'Created Date', width: 140, sortable: true },
            { field: 'modified_date', headerName: 'Modified Date', width: 140, sortable: true },
            { field: 'created_by', headerName: 'Created By', width: 120, sortable: true },
            { field: 'modified_by', headerName: 'Modified By', width: 120, sortable: true },
            { field: 'escalation_level_1', headerName: 'Escalation 1', width: 120, sortable: true },
            { field: 'escalation_level_2', headerName: 'Escalation 2', width: 120, sortable: true },
            { field: 'escalation_level_3', headerName: 'Escalation 3', width: 120, sortable: true },
            { field: 'notification_emails', headerName: 'Notification Emails', width: 160, sortable: true },
            { headerName: 'Actions', width: 120, pinned: 'right', cellRenderer: (p) => {
                    const container = document.createElement('div');
                    container.className = 'flex items-center justify-center space-x-2';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
                    editBtn.title = 'Edit Threshold';
                    editBtn.innerHTML = '<i class="pi pi-pencil text-sm"></i>';
                    editBtn.addEventListener('click', () => p.context.componentParent.editRow(p.data));
                    const delBtn = document.createElement('button');
                    delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
                    delBtn.title = 'Delete Threshold';
                    delBtn.innerHTML = '<i class="pi pi-trash text-sm"></i>';
                    delBtn.addEventListener('click', () => p.context.componentParent.deleteRow(p.data));
                    container.appendChild(editBtn);
                    container.appendChild(delBtn);
                    return container;
                } }
        ];
        this.gridOptions = { pagination: true, paginationPageSize: 20, animateRows: true, context: { componentParent: this } };
    }
    ngOnInit() {
        this.thresholdSub = this.thresholdService.thresholds$.subscribe(data => {
            this.thresholds = data;
            setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
        });
    }
    ngOnDestroy() {
        if (this.thresholdSub)
            this.thresholdSub.unsubscribe();
    }
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    onSearchChange(v) {
        this.search = v;
        if (this.searchTimer)
            clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.applyFilters(), 300);
    }
    applyFilters() {
        let filtered = this.thresholds;
        if (this.search.trim()) {
            const s = this.search.trim().toLowerCase();
            filtered = filtered.filter(t => (t.threshold_id?.toLowerCase().includes(s) ||
                t.threshold_type?.toLowerCase().includes(s) ||
                t.currency_code?.toLowerCase().includes(s) ||
                t.entity_type?.toLowerCase().includes(s)));
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
    deleteRow(row) { this.pendingDeleteId = row.threshold_id; this.showConfirmDelete = true; this.showSheet = false; }
    async confirmDelete() {
        if (!this.pendingDeleteId)
            return;
        await this.thresholdService.deleteThreshold(this.pendingDeleteId);
        this.showConfirmDelete = false;
        this.pendingDeleteId = null;
    }
    async confirmSave() {
        if (this.mode === 'edit' && this.form.threshold_id) {
            await this.thresholdService.updateThreshold(this.form.threshold_id, this.form);
        }
        else {
            await this.thresholdService.addThreshold(this.form);
        }
        this.showSheet = false;
        this.mode = 'add';
        this.form = {};
    }
};
ThresholdConfigurationComponent = __decorate([
    Component({
        selector: 'app-config-threshold-configuration',
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
        templateUrl: './threshold-configuration.component.html',
        styleUrls: []
    })
], ThresholdConfigurationComponent);
export { ThresholdConfigurationComponent };
//# sourceMappingURL=threshold-configuration.component.js.map