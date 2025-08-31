import { __decorate } from "tslib";
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromptFiltersPanelComponent } from './prompt-filters-panel.component';
import { TemplateCardListComponent } from './template-card-list.component';
import { TemplatePreviewComponent } from './template-preview.component';
let PromptTemplatesV2Component = class PromptTemplatesV2Component {
    constructor(svc, route, router, sessions) {
        this.svc = svc;
        this.route = route;
        this.router = router;
        this.sessions = sessions;
        this.families = [];
        this.categories = [];
        this.selectedFamily = '';
        this.selectedCategory = '';
        this.search = '';
        this.loading = false;
        this.responseText = '';
        // Streaming + session state (mirrors legacy UI behavior)
        this.isLoading = false;
        this.isStreaming = false;
        this.streamBuffer = '';
        this.reader = null;
        this.currentMsgUid = '';
        this.currentInstructionId = '';
        this.all = [];
        this.filtered = [];
        this.selectedIndex = -1;
    }
    async ngOnInit() {
        // Load persisted state
        const savedFamily = localStorage.getItem('pt.family') || '';
        const savedCategory = localStorage.getItem('pt.category') || '';
        const savedSearch = localStorage.getItem('pt.search') || '';
        const savedIndex = parseInt(localStorage.getItem('pt.index') || '-1', 10);
        this.route.queryParams.subscribe(async (params) => {
            this.loading = true;
            try {
                this.families = await this.svc.getUniqueFamilyTypes();
                // Query params override persisted; else default to Instructions & Processing / Inception
                const defFam = (this.families.find(f => (f.label || '').toLowerCase().includes('instructions'))?.value) || '';
                this.selectedFamily = (params['family'] ?? savedFamily) || defFam;
                this.selectedCategory = params['category'] ?? savedCategory;
                this.search = params['search'] ?? savedSearch;
                await this.refreshTemplates();
                await this.refreshCategories();
                if (!this.selectedCategory && this.categories?.length) {
                    const inception = this.categories.find(c => (c.label || '').toLowerCase().includes('inception'))?.value;
                    this.selectedCategory = inception || this.categories[0]?.value || '';
                }
                this.applyFilters();
                const qIndex = params['template'] != null ? parseInt(params['template'], 10) : NaN;
                this.selectedIndex = Number.isFinite(qIndex) ? qIndex : (Number.isFinite(savedIndex) ? savedIndex : -1);
                // Clamp index
                if (this.selectedIndex >= this.filtered.length)
                    this.selectedIndex = -1;
            }
            finally {
                this.loading = false;
            }
        });
    }
    async onFamilyChange(fam) {
        this.selectedFamily = fam || '';
        this.selectedCategory = '';
        await this.refreshTemplates();
        await this.refreshCategories();
        this.applyFilters();
        this.persistAndSyncUrl();
    }
    async onCategoryChange(cat) { this.selectedCategory = cat || ''; this.applyFilters(); this.persistAndSyncUrl(); }
    onSearchChange(q) { this.search = q || ''; this.applyFilters(); this.persistAndSyncUrl(); }
    async refreshTemplates() {
        if (this.selectedFamily) {
            this.all = await this.svc.getTemplatesByFamilyType(this.selectedFamily);
        }
        else {
            // fallback: service loadTemplates populates BehaviorSubject; we can call search without family
            this.all = await this.svc.searchTemplates(this.search || '');
        }
    }
    async refreshCategories() {
        if (!this.selectedFamily) {
            this.categories = [];
            return;
        }
        const cats = await this.svc.getTemplateCategoriesByFamily(this.selectedFamily);
        const counts = {};
        this.all.forEach(t => { const k = t.template_category || ''; counts[k] = (counts[k] || 0) + 1; });
        this.categories = cats.map(c => ({ ...c, count: counts[c.value] || 0 }));
    }
    applyFilters() {
        const q = (this.search || '').toLowerCase();
        this.filtered = this.all.filter(t => {
            const okCat = this.selectedCategory ? (t.template_category === this.selectedCategory) : true;
            const okSearch = q ? ((t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || (t.prompt_text || '').toLowerCase().includes(q)) : true;
            return okCat && okSearch;
        });
        // Limit to max 5 visible templates per requirements
        this.filtered = (this.filtered || []).slice(0, 5);
        if (this.filtered.length === 0)
            this.selectedIndex = -1;
    }
    select(i) { this.selectedIndex = i; this.persistAndSyncUrl(); }
    get selectedTemplate() { return (this.selectedIndex >= 0 ? this.filtered[this.selectedIndex] : null) || null; }
    get selectedFields() {
        const storedRaw = this.selectedTemplate?.input_fields || [];
        const stored = Array.isArray(storedRaw) ? storedRaw.map(v => (v == null ? '' : String(v))) : [];
        const extracted = this.svc.getInputFields(this.selectedTemplate?.prompt_text || '') || [];
        // Merge unique, prefer order from prompt extraction; coerce to strings defensively
        const set = new Set();
        const merged = [];
        (extracted || []).forEach(f => { const s = String(f || '').trim(); const k = s.toLowerCase(); if (k && !set.has(k)) {
            set.add(k);
            merged.push(s);
        } });
        (stored || []).forEach(f => { const s = String(f || '').trim(); const k = s.toLowerCase(); if (k && !set.has(k)) {
            set.add(k);
            merged.push(s);
        } });
        return merged;
    }
    async submit(payload) {
        const filled = payload?.text || '';
        if (!filled)
            return;
        this.responseText = '';
        // Generate identifiers for this request
        this.currentMsgUid = this.generateMsgUID();
        this.currentInstructionId = this.generateInstructionId();
        // Create DB session (pending) but do not block on failure
        await this.sessions.createSession(filled, this.currentMsgUid, this.currentInstructionId, this.selectedCategory || 'template', this.selectedIndex + 1);
        // Optimistic usage increment
        const id = this.selectedTemplate?.id;
        if (id)
            this.svc.incrementUsageCount(id).catch(() => { });
        // Send to executor (Dify) with streaming
        this.sendToDifyAgent(filled);
    }
    generateMsgUID() {
        return 'MSG-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    generateInstructionId() {
        return 'INSTR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    async updateDatabaseSession(status, tokenUsage) {
        try {
            await this.sessions.updateSession(this.currentMsgUid, {
                agent_status: status,
                agent_response: {
                    text: this.responseText,
                    ...(tokenUsage ? { usage: tokenUsage } : {})
                }
            });
        }
        catch (err) {
            console.error('update session error', err);
        }
    }
    sendToDifyAgent(query) {
        // Enhanced prompt with unique identifiers
        const enhancedQuery = `[MSG_UID: ${this.currentMsgUid}] [INSTRUCTION_ID: ${this.currentInstructionId}] ${query}`;
        const payload = {
            conversation_id: '',
            inputs: { msg_uid: this.currentMsgUid, instruction_id: this.currentInstructionId },
            query: enhancedQuery,
            user: 'test-user',
            response_mode: 'streaming'
        };
        // Reset streaming state
        this.streamBuffer = '';
        this.responseText = '';
        this.isStreaming = true;
        this.isLoading = true;
        fetch('https://api.dify.ai/v1/chat-messages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer app-KKtaMynVyn8tKbdV9VbbaeyR',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            if (!response.body)
                throw new Error('Empty response body');
            this.isLoading = false;
            this.reader = response.body.getReader();
            return this.processStream(this.reader);
        }).catch(err => {
            console.error('Dify error:', err);
            this.isLoading = false;
            this.isStreaming = false;
            this.responseText = `Error: ${err?.message || err}`;
            this.updateDatabaseSession('failed').catch(() => { });
        });
    }
    async processStream(reader) {
        const decoder = new TextDecoder();
        let done = false;
        try {
            while (!done) {
                const { value, done: d } = await reader.read();
                done = d || false;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    // naive SSE handling: append raw text; production can parse `data:` lines
                    this.responseText += chunk;
                }
            }
            this.isStreaming = false;
            this.updateDatabaseSession('completed').catch(() => { });
        }
        catch (e) {
            console.error('stream error', e);
            this.isStreaming = false;
            this.updateDatabaseSession('failed').catch(() => { });
        }
    }
    persistAndSyncUrl() {
        localStorage.setItem('pt.family', this.selectedFamily || '');
        localStorage.setItem('pt.category', this.selectedCategory || '');
        localStorage.setItem('pt.search', this.search || '');
        localStorage.setItem('pt.index', String(this.selectedIndex));
        const qp = {};
        if (this.selectedFamily)
            qp.family = this.selectedFamily;
        if (this.selectedCategory)
            qp.category = this.selectedCategory;
        if (this.search)
            qp.search = this.search;
        if (this.selectedIndex >= 0)
            qp.template = this.selectedIndex;
        this.router.navigate([], { queryParams: qp, queryParamsHandling: 'merge' });
    }
    // Keyboard navigation across the list
    onKeydown(e) {
        if (!this.filtered?.length)
            return;
        if (e.key === 'ArrowDown') {
            this.selectedIndex = Math.min(this.filtered.length - 1, Math.max(0, this.selectedIndex) + 1);
            e.preventDefault();
            this.persistAndSyncUrl();
        }
        if (e.key === 'ArrowUp') {
            this.selectedIndex = Math.max(0, (this.selectedIndex < 0 ? 0 : this.selectedIndex) - 1);
            e.preventDefault();
            this.persistAndSyncUrl();
        }
        if (e.key === 'Enter') {
            this.submit({ text: this.selectedTemplate?.prompt_text || '', values: {} });
            e.preventDefault();
        }
    }
};
__decorate([
    HostListener('keydown', ['$event'])
], PromptTemplatesV2Component.prototype, "onKeydown", null);
PromptTemplatesV2Component = __decorate([
    Component({
        selector: 'app-hawk-prompt-templates-v2',
        standalone: true,
        imports: [CommonModule, FormsModule, PromptFiltersPanelComponent, TemplateCardListComponent, TemplatePreviewComponent],
        template: `
    <div class="p-6 min-h-full flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Template Mode</h2>
          <div class="text-xs text-gray-500">HAWK Agent</div>
        </div>
      </div>
      <div class="flex-1 grid gap-4" style="grid-template-columns: 280px 1fr 400px; min-height: 0;">
        <div class="bg-white border rounded-lg p-3 overflow-auto">
          <app-pt-filters [families]="families" [categories]="categories" [selectedFamily]="selectedFamily"
                          [selectedCategory]="selectedCategory" [search]="search"
                          (familyChange)="onFamilyChange($event)" (categoryChange)="onCategoryChange($event)"
                          (searchChange)="onSearchChange($event)"></app-pt-filters>
        </div>
        <div class="bg-white border rounded-lg p-3 overflow-auto min-h-0" style="max-height: 520px;">
          <div *ngIf="loading" class="text-sm text-gray-500">Loading templates...</div>
          <app-pt-card-list *ngIf="!loading" [templates]="filtered" [selectedIndex]="selectedIndex" (select)="select($event)"></app-pt-card-list>
        </div>
        <div class="bg-white border rounded-lg p-3 overflow-auto">
          <app-pt-preview [template]="selectedTemplate" [fields]="selectedFields" [responseText]="responseText" (onSend)="submit($event)"></app-pt-preview>
        </div>
      </div>
    </div>
  `
    })
], PromptTemplatesV2Component);
export { PromptTemplatesV2Component };
//# sourceMappingURL=prompt-templates-v2.component.js.map