import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-pt-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full">
      <div class="px-2 py-1 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Results</h3>
      </div>
      <div class="flex-1 overflow-auto">
        <div class="p-2">
          <div class="text-gray-800 leading-relaxed text-sm font-sans w-full prose prose-sm max-w-none"
               style="word-break: break-word; overflow-wrap: anywhere; max-width: 100%; font-family: inherit;"
               [innerHTML]="getFormattedResponse()"></div>

          <div *ngIf="streaming" class="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm text-blue-700 font-medium">Receiving response...</span>
            <div class="flex gap-1 ml-2">
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>

        <div *ngIf="getResponseMetadata()" class="px-3 py-2 bg-blue-100 border-t border-blue-200">
          <div class="text-xs text-blue-700 font-mono">{{ getResponseMetadata() }}</div>
        </div>
      </div>

      <div class="px-2 py-2 border-t border-gray-100 flex flex-wrap gap-2">
        <button class="btn btn-secondary" (click)="export.emit()"><i class="pi pi-download"></i><span>Export Report</span></button>
        <button class="btn btn-secondary" (click)="ticket.emit()"><i class="pi pi-ticket"></i><span>Create Ticket</span></button>
        <button class="btn btn-secondary" (click)="schedule.emit()"><i class="pi pi-calendar"></i><span>Schedule Review</span></button>
        <button class="btn btn-secondary" (click)="share.emit()"><i class="pi pi-share-alt"></i><span>Share</span></button>
      </div>

      <!-- Rating & Completion, similar to legacy UI -->
      <div class="px-2 py-3 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Rate this response</h4>
            <p class="text-xs text-gray-600 mb-3">Help improve template accuracy by rating the quality of this result</p>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <button *ngFor="let star of [1,2,3,4,5]; let i = index"
                        (click)="rate.emit(star)"
                        class="text-lg transition-colors duration-200"
                        [class]="star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-300'">
                  <i class="pi pi-star-fill"></i>
                </button>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button class="px-3 py-1 text-xs rounded-full border transition-colors"
                        [class]="rating >= 4 ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-green-50'"
                        (click)="rate.emit(5)">
                  <i class="pi pi-check-circle mr-1"></i>
                  Correct
                </button>
                <button class="px-3 py-1 text-xs rounded-full border transition-colors"
                        [class]="rating <= 2 ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-red-50'"
                        (click)="rate.emit(1)">
                  <i class="pi pi-times-circle mr-1"></i>
                  Incorrect
                </button>
              </div>
              <div class="flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
                <button class="px-3 py-1 text-xs rounded-full border transition-colors"
                        [class]="completion === 'complete' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50'"
                        (click)="setCompletion.emit('complete')">
                  <i class="pi pi-check mr-1"></i>
                  Complete
                </button>
                <button class="px-3 py-1 text-xs rounded-full border transition-colors"
                        [class]="completion === 'incomplete' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-orange-50'"
                        (click)="setCompletion.emit('incomplete')">
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  Incomplete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TemplateResultsComponent {
  @Input() responseText = '';
  @Input() streaming = false;
  @Input() rating = 0;
  @Input() completion: 'complete'|'incomplete'|null = null;
  @Output() export = new EventEmitter<void>();
  @Output() ticket = new EventEmitter<void>();
  @Output() schedule = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() rate = new EventEmitter<number>();
  @Output() setCompletion = new EventEmitter<'complete'|'incomplete'>();

  constructor(private sanitizer: DomSanitizer) {}

  private getCleanResponse(): string {
    if (!this.responseText) return '';
    const parts = this.responseText.split('\n\n---\n');
    return parts[0] || this.responseText;
  }

  getFormattedResponse(): SafeHtml {
    if (!this.responseText) return this.sanitizer.bypassSecurityTrustHtml('');
    const cleanResponse = this.getCleanResponse();
    let formattedText = cleanResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = this.convertTablesToHtml(formattedText);
    const escapedText = formattedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
      .replace(/&lt;table([^&]*)&gt;/g, '<table$1>')
      .replace(/&lt;\/table&gt;/g, '</table>')
      .replace(/&lt;thead([^&]*)&gt;/g, '<thead$1>')
      .replace(/&lt;\/thead&gt;/g, '</thead>')
      .replace(/&lt;tbody([^&]*)&gt;/g, '<tbody$1>')
      .replace(/&lt;\/tbody&gt;/g, '</tbody>')
      .replace(/&lt;tr([^&]*)&gt;/g, '<tr$1>')
      .replace(/&lt;\/tr&gt;/g, '</tr>')
      .replace(/&lt;th([^&]*)&gt;/g, '<th$1>')
      .replace(/&lt;\/th&gt;/g, '</th>')
      .replace(/&lt;td([^&]*)&gt;/g, '<td$1>')
      .replace(/&lt;\/td&gt;/g, '</td>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(escapedText);
  }

  getResponseMetadata(): string {
    if (!this.responseText) return '';
    const parts = this.responseText.split('\n\n---\n');
    if (parts.length > 1) return parts[1].trim();
    return '';
  }

  private convertTablesToHtml(text: string): string {
    const lines = text.split('\n');
    let result = '';
    let inTable = false;
    let tableRows: string[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|') && line.includes('|')) {
        if (!inTable) { inTable = true; tableRows = []; }
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        tableRows.push(cells);
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const isSeparator = /^\|[\s\-:]+\|$/.test(nextLine);
        if (i === lines.length - 1 || !lines[i + 1].trim().startsWith('|') || isSeparator) {
          if (isSeparator) i++;
          let tableHtml = '<table class="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden my-4">';
          if (tableRows.length > 0) {
            tableHtml += '<thead class="bg-gray-50"><tr>';
            tableRows[0].forEach(cell => { tableHtml += `<th class=\"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200\">${cell}</th>`; });
            tableHtml += '</tr></thead>';
          }
          if (tableRows.length > 1) {
            tableHtml += '<tbody class="bg-white divide-y divide-gray-200">';
            for (let j = 1; j < tableRows.length; j++) {
              tableHtml += '<tr class="hover:bg-gray-50">';
              tableRows[j].forEach(cell => { tableHtml += `<td class=\"px-4 py-3 text-sm text-gray-900 border-b border-gray-100\">${cell}</td>`; });
              tableHtml += '</tr>';
            }
            tableHtml += '</tbody>';
          }
          tableHtml += '</table>';
          result += tableHtml;
          inTable = false;
          tableRows = [];
        }
      } else {
        if (inTable) {
          if (tableRows.length > 0) {
            let tableHtml = '<table class="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden my-4">';
            tableHtml += '<tbody class="bg-white divide-y divide-gray-200">';
            tableRows.forEach(row => {
              tableHtml += '<tr class="hover:bg-gray-50">';
              row.forEach(cell => { tableHtml += `<td class=\"px-4 py-3 text-sm text-gray-900 border-b border-gray-100\">${cell}</td>`; });
              tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
            result += tableHtml;
          }
          inTable = false;
          tableRows = [];
        }
        result += line + '\n';
      }
    }
    return result;
  }
}
