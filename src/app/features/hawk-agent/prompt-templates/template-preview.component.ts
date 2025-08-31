import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromptTemplate } from '../../configuration/prompt-templates/prompt-templates.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { EntityMasterService, EntityMaster } from '../../configuration/entity/entity-master.service';
import { PromptTemplatesService } from '../../configuration/prompt-templates/prompt-templates.service';

@Component({
  selector: 'app-pt-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="border-b pb-2 mb-2">
        <div class="text-sm text-gray-500">Template</div>
        <div class="text-base font-semibold text-gray-900 truncate">{{ template?.name || 'Select a template' }}</div>
      </div>
      <div class="flex-1 min-h-0 overflow-auto space-y-3">
        <ng-container *ngIf="template; else empty">
          <div>
            <div class="text-xs text-gray-500 mb-1">Prompt Text (live)</div>
            <pre class="bg-gray-50 border rounded p-2 text-xs whitespace-pre-wrap">{{ filledPrompt || (template ? template.prompt_text : '') }}</pre>
          </div>
          <div *ngIf="fields?.length; else noParams">
            <div class="text-xs text-gray-500 mb-1">Input Parameters</div>
            <div class="grid grid-cols-1 gap-2">
              <label *ngFor="let f of fields" class="text-xs">
                <span class="block text-[11px] text-gray-600 mb-1">{{ f }}</span>
                <ng-container *ngIf="isSelect(f); else textField">
                  <select class="filter-input w-full" [(ngModel)]="values[f]" (ngModelChange)="computeFilled()">
                    <option value="">-- Select --</option>
                    <ng-container *ngIf="f.toLowerCase().includes('currency'); else entityOpts">
                      <option *ngFor="let c of currencyOptions" [value]="c">{{ c }}</option>
                    </ng-container>
                    <ng-template #entityOpts>
                      <option *ngFor="let e of entityOptions" [value]="entityOptionValueFor(f, e)">{{ e.label }}</option>
                    </ng-template>
                  </select>
                </ng-container>
                <ng-template #textField>
                  <input class="filter-input w-full" [type]="getType(f)" [(ngModel)]="values[f]" (ngModelChange)="computeFilled()" [placeholder]="getPlaceholder(f)" />
                </ng-template>
              </label>
            </div>
          </div>
          <ng-template #noParams>
            <div class="text-xs text-gray-500">No input parameters detected from the prompt.</div>
          </ng-template>
          <div class="pt-2 mt-2 border-t flex items-center justify-end">
            <div class="flex items-center gap-2">
              <div *ngIf="streaming" class="flex items-center gap-2 mr-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="text-xs text-blue-700">Streaming...</span>
              </div>
              <button class="btn btn-primary" (click)="send()" [disabled]="streaming"><i class="pi pi-send"></i><span>Submit</span></button>
            </div>
          </div>
        </ng-container>
        <ng-template #empty>
          <div class="text-sm text-gray-500">Choose a template to see details.</div>
        </ng-template>
      </div>
    </div>
  `
})
export class TemplatePreviewComponent implements OnChanges, OnInit {
  @Input() template: PromptTemplate | null = null;
  @Input() fields: string[] = [];
  @Output() onSend = new EventEmitter<{ text: string; values: Record<string,string> }>();
  @Input() responseText = '';
  @Input() streaming = false;
  values: Record<string,string> = {};
  filledPrompt = '';
  currencyOptions: string[] = [];
  entityOptions: { label: string; value: string }[] = [];
  copied = false;

  send(){
    const text = this.filledPrompt || (this.template?.prompt_text || '');
    this.onSend.emit({ text, values: this.values });
  }
  getType(f: string){
    const name = (f||'').toLowerCase();
    if (name.includes('date')) return 'date';
    if (name.includes('amount') || name.includes('qty') || name.includes('quantity') || name.includes('rate')) return 'number';
    return 'text';
  }
  getPlaceholder(f: string){
    const name = (f||'').toLowerCase();
    if (name.includes('date')) return 'YYYY-MM-DD';
    if (name.includes('currency')) return 'e.g., USD';
    if (name.includes('amount') || name.includes('qty') || name.includes('quantity')) return 'e.g., 100000';
    if (name.includes('rate')) return 'e.g., 0.05';
    if (name.includes('entity')) return 'e.g., Entity A';
    return `Enter ${f}`;
  }
  isSelect(f: string){
    const name = (f||'').toLowerCase();
    const flat = name.replace(/\s+/g,'_');
    return name.includes('currency') || name === 'entity' || flat.includes('entity_id') || flat.includes('entity_code') || flat.includes('entity_name');
  }
  getSelectOptions(f: string){
    const name = (f||'').toLowerCase();
    const flat = name.replace(/\s+/g,'_');
    if (name.includes('currency')) return this.currencyOptions;
    if (name === 'entity' || flat.includes('entity_id') || flat.includes('entity_code') || flat.includes('entity_name')) return this.entityOptions;
    return [] as any;
  }
  constructor(private currencySvc: CurrencyService, private entitySvc: EntityMasterService, private ptSvc: PromptTemplatesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(){
    // Load currency options
    try { this.currencySvc.getCurrencyCodes().subscribe(list => this.currencyOptions = list || []); } catch {}
    // Load entity options
    try {
      this.entitySvc.entities$.subscribe((ents: EntityMaster[]) => {
        const items = (ents||[]).map(e => ({ label: `${e.entity_name} (${e.legal_entity_code})`, value: e.legal_entity_code }));
        this.entityOptions = items;
      });
    } catch {}
  }
  ngOnChanges(ch: SimpleChanges){
    // Only reset values if template actually changed or if fields meaningfully changed
    if (ch['template'] && ch['template'].currentValue !== ch['template'].previousValue) {
      console.log('Template changed, resetting values');
      this.values = {};
      (this.fields||[]).forEach(f=> this.values[f] = '');
      this.computeFilled();
    } else if (ch['fields']) {
      // Only reset if the actual field names changed (not just reference changes)
      const prevFields = ch['fields'].previousValue || [];
      const currFields = ch['fields'].currentValue || [];
      const fieldsChanged = JSON.stringify(prevFields) !== JSON.stringify(currFields);
      
      if (fieldsChanged) {
        console.log('Fields meaningfully changed, updating values');
        // Preserve existing values, only add new fields
        (this.fields||[]).forEach(f=> {
          if (!(f in this.values)) {
            this.values[f] = '';
          }
        });
        this.computeFilled();
      }
    }
  }
  computeFilled(){
    const text = this.template?.prompt_text || '';
    const map = this.values || {};
    
    // Only log if there are actual values to avoid spam
    if (Object.values(map).some(v => v)) {
      console.log('computeFilled with values:', { text, values: map });
    }
    
    // Expand keys to multiple variants to maximize match success (parity with legacy UX)
    const expanded: Record<string,string> = {};
    Object.keys(map).forEach(k => {
      const v = map[k] ?? '';
      const raw = String(k);
      const trim = raw.trim();
      const lower = trim.toLowerCase();
      const withUnderscore = trim.replace(/\s+/g,'_');
      const withSpace = trim.replace(/_/g,' ');
      const lowerUnderscore = lower.replace(/\s+/g,'_');
      const lowerSpace = lower.replace(/_/g,' ');
      [raw, trim, lower, withUnderscore, withSpace, lowerUnderscore, lowerSpace].forEach(key => { expanded[key] = v; });
    });
    
    this.filledPrompt = this.ptSvc.fillTemplate(text, expanded);
    
    // Only log the result if there are values
    if (Object.values(map).some(v => v)) {
      console.log('Final filled template:', this.filledPrompt);
    }
    
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }
  escapeReg(s:string){ return s.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&'); }
  // quick fill removed per request

  // copy button removed per request

  entityOptionValueFor(field: string, opt: { label: string; value: string }): string {
    const name = (field||'').toLowerCase();
    const flat = name.replace(/\s+/g,'_');
    if (flat.includes('entity_name')) return opt.label;
    if (flat.includes('entity_code') || flat.includes('entity_id')) return opt.value;
    // generic 'entity' defaults to label (human-friendly)
    if (name === 'entity') return opt.label;
    return opt.value;
  }
}
