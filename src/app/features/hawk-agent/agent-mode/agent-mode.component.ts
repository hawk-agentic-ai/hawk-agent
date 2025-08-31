import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AGENT_IFRAME_URL } from '../../../core/config/app-config';

@Component({
  selector: 'app-hawk-agent-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 min-h-full flex flex-col" style="height: 100vh;">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Agent Mode</h2>
          <div class="text-xs text-gray-500">HAWK Agent</div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">Template Mode</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only" [ngModel]="isAgentMode" (ngModelChange)="onToggle($event)">
            <div class="relative" role="switch" [attr.aria-checked]="isAgentMode">
              <div class="w-12 h-7 rounded-full transition-colors duration-200 shadow-inner ring-1" [ngClass]="isAgentMode ? 'bg-blue-600 ring-blue-600' : 'bg-gray-300 ring-gray-300'"></div>
              <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transform transition duration-200" [class.translate-x-5]="isAgentMode"></div>
            </div>
          </label>
          <span class="text-sm text-blue-700 font-medium">Agent Mode</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0" style="height: 80vh;">
        <iframe [src]="agentUrlSafe" class="w-full h-full" style="border:0; height: 100%;" allow="microphone; clipboard-read; clipboard-write"></iframe>
      </div>
    </div>
  `
})
export class AgentModeComponent {
  agentUrlSafe: SafeResourceUrl;
  isAgentMode = true;
  constructor(private sanitizer: DomSanitizer, private router: Router){
    this.agentUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(AGENT_IFRAME_URL);
  }
  onToggle(v: boolean){
    this.isAgentMode = !!v;
    if (!this.isAgentMode){
      this.router.navigate(['/hawk-agent/prompt-templates']);
    }
  }
}
