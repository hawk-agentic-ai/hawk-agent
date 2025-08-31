import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
let BufferConfigurationComponent = class BufferConfigurationComponent {
    constructor(ngZone, svc, entitySvc, frameworkSvc) {
        this.ngZone = ngZone;
        this.svc = svc;
        this.entitySvc = entitySvc;
        this.frameworkSvc = frameworkSvc;
        this.defaultColDef = { resizable: true, sortable: true, filter: 'agSetColumnFilter', minWidth: 100 };
        this.columnDefs = [
            { field: 'buffer_rule_id', headerName: 'Rule ID', minWidth: 150, sortable: true },
            { field: 'entity_type', headerName: 'Entity Type', width: 140, sortable: true },
            { field: 'entity_id', headerName: 'Entity ID', width: 160, sortable: true },
            { field: 'currency_code', headerName: 'Currency', width: 100, sortable: true },
            { field: 'hedging_framework', headerName: 'Framework', width: 140, sortable: true },
            { field: 'minimum_buffer_amount', headerName: 'Min Buffer', width: 140, type: 'numericColumn' },
            { field: 'maximum_buffer_amount', headerName: 'Max Buffer', width: 140, type: 'numericColumn' },
            { field: 'buffer_percentage', headerName: 'Buffer %', width: 110, type: 'numericColumn' },
            { field: 'active_flag', headerName: 'Status', width: 110, cellRenderer: (p) => {
                    const val = (p.value || '').toUpperCase() === 'Y' ? 'Active' : 'Inactive';
                    const cls = val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    const span = document.createElement('span');
                    span.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
                    span.textContent = val;
                    return span;
                } },
            { field: 'effective_date', headerName: 'Effective', width: 130, sortable: true },
            { field: 'expiry_date', headerName: 'Expiry', width: 130, sortable: true },
            { field: 'rule_priority', headerName: 'Priority', width: 110, type: 'numericColumn' },
            { field: 'nav_type_priority', headerName: 'NAV Priority', width: 140 },
            { headerName: 'Actions', width: 120, pinned: 'right', cellRenderer: (p) => {
                    const container = document.createElement('div');
                    container.className = 'flex items-center justify-center space-x-2';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'text-gray-500 hover:text-blue-600 p-1';
                    editBtn.title = 'Edit Buffer Rule';
                    editBtn.innerHTML = '<i class="pi pi-pencil text-sm"></i>';
                    editBtn.addEventListener('click', () => p.context.componentParent.editRow(p.data));
                    const delBtn = document.createElement('button');
                    delBtn.className = 'text-gray-500 hover:text-red-600 p-1';
                    delBtn.title = 'Delete Buffer Rule';
                    delBtn.innerHTML = '<i class="pi pi-trash text-sm"></i>';
                    delBtn.addEventListener('click', () => p.context.componentParent.deleteRow(p.data));
                    container.appendChild(editBtn);
                    container.appendChild(delBtn);
                    return container;
                } }
        ];
        this.gridOptions = { pagination: true, paginationPageSize: 20, animateRows: true, context: { componentParent: this } };
        // Data/state
        this.rows = [];
        this.search = '';
        // Dialog state
        this.showDialog = false;
        this.mode = 'add';
        this.form = {};
        // Dropdowns
        this.entityTypeOptions = [];
        this.entityIdOptions = [];
        this.latestEntities = [];
        this.hedgingFrameworkOptions = [];
        this.frameworksCache = [];
    }
    ngOnInit() {
        this.sub = this.svc.rows$.subscribe(data => {
            this.rows = data;
            setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
        });
        // Load entity options from entity_master
        this.entitiesSub = this.entitySvc.entities$.subscribe((entities) => {
            this.latestEntities = entities || [];
            const types = Array.from(new Set(this.latestEntities.map(e => e.entity_type).filter(Boolean)));
            this.entityTypeOptions = types.map(t => ({ label: t, value: t }));
            // If a type is already selected in form, refresh IDs accordingly
            if (this.form.entity_type) {
                this.refreshEntityIds(this.latestEntities, this.form.entity_type);
            }
        });
        // Load hedging frameworks list for dropdown
        this.loadFrameworkOptions();
    }
    ngOnDestroy() {
        if (this.sub)
            this.sub.unsubscribe();
        if (this.entitiesSub)
            this.entitiesSub.unsubscribe();
    }
    onGridReady(e) { this.gridApi = e.api; e.api.sizeColumnsToFit(); }
    onSearchChange(v) {
        this.search = v;
        if (this.searchTimer)
            clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.applyFilters(), 300);
    }
    applyFilters() {
        let filtered = this.rows;
        if (this.search.trim()) {
            const s = this.search.trim().toLowerCase();
            filtered = filtered.filter(t => (t.buffer_rule_id?.toLowerCase().includes(s) ||
                t.entity_id?.toLowerCase().includes(s) ||
                t.entity_type?.toLowerCase().includes(s) ||
                t.currency_code?.toLowerCase().includes(s) ||
                t.hedging_framework?.toLowerCase().includes(s)));
        }
        this.gridApi?.setRowData(filtered);
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
    }
    openAdd() {
        this.mode = 'add';
        this.form = { active_flag: 'Y', buffer_percentage: 0, rule_priority: 1 };
        this.ngZone.run(() => this.showDialog = true);
    }
    editRow(row) {
        this.mode = 'edit';
        this.form = { ...row };
        this.ngZone.run(() => this.showDialog = true);
    }
    async deleteRow(row) {
        if (!row?.buffer_rule_id)
            return;
        if (confirm('Delete this buffer rule?')) {
            await this.svc.delete(row.buffer_rule_id);
        }
    }
    async confirmSave() {
        if (this.mode === 'edit' && this.form.buffer_rule_id) {
            await this.svc.update(this.form.buffer_rule_id, this.form);
        }
        else {
            await this.svc.add(this.form);
        }
        this.showDialog = false;
        this.mode = 'add';
        this.form = {};
    }
    onEntityTypeChange(value) {
        this.refreshEntityIds(this.latestEntities, value);
        // Reset selected entity_id when type changes
        this.form.entity_id = '';
        // Refresh framework options (optionally filter by entity)
        this.refreshFrameworkOptions();
    }
    onEntityChange(value) {
        this.form.entity_id = value;
        this.refreshFrameworkOptions();
    }
    refreshEntityIds(entities, type) {
        const filtered = (entities || []).filter(e => !type || e.entity_type === type);
        this.entityIdOptions = filtered.map(e => ({ label: `${e.entity_name} (${e.legal_entity_code})`, value: e.legal_entity_code }));
    }
    async loadFrameworkOptions() {
        try {
            const rows = await this.frameworkSvc.list({});
            this.frameworksCache = rows || [];
            this.refreshFrameworkOptions();
        }
        catch (e) {
            console.error('Failed to load hedging frameworks', e);
            this.frameworksCache = [];
            this.hedgingFrameworkOptions = [];
        }
    }
    refreshFrameworkOptions() {
        const entityId = this.form.entity_id;
        const filtered = entityId ? this.frameworksCache.filter(f => (f.entity_id || '') === entityId) : this.frameworksCache;
        // Build unique hedging_state list (non-empty)
        const seen = new Set();
        const options = [];
        for (const f of filtered) {
            const state = (f.hedging_state || '').trim();
            if (!state || seen.has(state))
                continue;
            seen.add(state);
            options.push({ label: state, value: state });
        }
        this.hedgingFrameworkOptions = options;
    }
};
BufferConfigurationComponent = __decorate([
    Component({
        selector: 'app-config-buffer-configuration',
        standalone: true,
        imports: [
            CommonModule,
            FormsModule,
            AgGridAngular,
            ButtonModule,
            InputTextModule,
            DropdownModule,
            DialogModule
        ],
        templateUrl: './buffer-configuration.component.html',
        styleUrls: []
    })
], BufferConfigurationComponent);
export { BufferConfigurationComponent };
//# sourceMappingURL=buffer-configuration.component.js.map