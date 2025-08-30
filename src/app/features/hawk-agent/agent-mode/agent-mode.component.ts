import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AGENT_IFRAME_URL, AGENT_IFRAME_ORIGIN } from '../../../core/config/app-config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hawk-agent-mode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6 h-full flex flex-col">
      <!-- Page Header -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Agent Mode</h2>
        <p class="text-gray-600 text-sm">Embedded Dify Agent, styled within app container</p>
      </div>

      <!-- Themed Container with Skeleton Loader -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden relative flex-1 min-h-0">
        <!-- Floating prompt toast (does not affect iframe layout) -->
        <!-- Prompt overlay: non-intrusive (doesn't change layout), click-through safe -->
        <div *ngIf="incomingPrompt && showPromptToast && !isMinimized" class="absolute z-30 top-4 right-4 max-w-xl pointer-events-none">
          <div class="flex items-center gap-3 bg-gray-900/90 text-white rounded-md px-3 py-2 shadow-lg border border-gray-800 pointer-events-auto">
            <div class="text-sm truncate flex-1">
              <span class="font-medium">Prompt ready:</span>
              <span class="ml-1">{{ incomingPrompt }}</span>
            </div>
            <button class="btn btn-secondary" (click)="copyPrompt()" title="Copy to clipboard">
              <i class="pi pi-copy"></i>
              <span>{{ copied ? 'Copied' : 'Copy' }}</span>
            </button>
            <button class="btn btn-primary" (click)="sendPromptToIframe()">
              <i class="pi pi-send"></i>
              <span>Send</span>
            </button>
            <button class="btn btn-tertiary" (click)="minimizePromptToast()" title="Minimize">
              <i class="pi pi-minus"></i>
            </button>
            <button class="btn btn-tertiary" (click)="dismissPromptToast()" title="Dismiss">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <!-- Minimized chip (stay top-right; avoid layout shift) -->
        <div *ngIf="incomingPrompt && showPromptToast && isMinimized" class="absolute z-30 top-4 right-4 pointer-events-none">
          <div class="flex items-center gap-2 bg-gray-900/90 text-white rounded-full px-3 py-1.5 shadow-md border border-gray-800 pointer-events-auto">
            <i class="pi pi-comment"></i>
            <span class="text-xs truncate max-w-[260px]">Prompt ready</span>
            <button class="btn btn-secondary" (click)="copyPrompt()" title="Copy">
              <i class="pi pi-copy text-xs"></i>
            </button>
            <button class="btn btn-primary" (click)="expandPromptToast()" title="Expand">
              <i class="pi pi-angle-up"></i>
            </button>
            <button class="btn btn-tertiary" (click)="dismissPromptToast()" title="Dismiss">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <!-- Skeleton while loading -->
        <div *ngIf="!iframeLoaded && !loadNotice" class="absolute inset-0 p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Notice if iframe fails to load (likely blocked by embed policy) -->
        <div *ngIf="loadNotice && !iframeLoaded" class="absolute inset-0 p-6 flex items-center justify-center">
          <div class="text-center text-sm text-gray-600">
            <div class="mb-2 font-medium text-gray-800">Unable to load embedded agent</div>
            <div>It may be blocked by the site’s embed policy (X-Frame-Options/CSP).</div>
          </div>
        </div>

        <!-- Iframe wrapper to retain sizing inside container -->
        <div class="w-full h-full flex-1 min-h-0">
          <iframe
            #agentFrame
            [src]="agentUrlSafe"
            (load)="onIframeLoad()"
            allow="microphone; clipboard-write;"
            frameborder="0"
            style="width: 100%; height: 100%; min-height: 700px; display: block;"
            [class.opacity-0]="!iframeLoaded"
            class="transition-opacity duration-300">
          </iframe>
        </div>
      </div>
    </div>
  `
})
export class AgentModeComponent implements OnInit, OnDestroy {
  @ViewChild('agentFrame') agentFrameRef?: ElementRef<HTMLIFrameElement>;

  iframeLoaded = false;
  agentUrl: string = AGENT_IFRAME_URL;
  agentUrlSafe!: SafeResourceUrl;
  private agentOrigin: string = AGENT_IFRAME_ORIGIN;
  loadNotice = false;
  private noticeTimer?: any;
  incomingPrompt: string | null = null;
  copied = false;
  showPromptToast = false;
  isMinimized = false;

  private onMessage = (event: MessageEvent) => {
    // Basic safety: only react to messages from the configured origin (if known)
    if (this.agentOrigin !== '*' && event.origin !== this.agentOrigin) return;
    // Placeholder: log any messages for future interop
    // console.debug('Agent iframe message:', event.data);
  };

  constructor(private sanitizer: DomSanitizer, private router: Router) {}

  ngOnInit() {
    // Prepare a SafeResourceUrl for the iframe
    this.agentUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.agentUrl);
    window.addEventListener('message', this.onMessage);
    // Capture preset prompt from navigation state if present
    const state = (history?.state || {}) as any;
    if (state && typeof state.presetPrompt === 'string' && state.presetPrompt.trim()) {
      this.incomingPrompt = state.presetPrompt.trim();
      this.showPromptToast = true;
    }
    // If the iframe doesn't load in time, show an informative notice
    this.noticeTimer = setTimeout(() => {
      if (!this.iframeLoaded) this.loadNotice = true;
    }, 4000);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
  }

  onIframeLoad() {
    this.iframeLoaded = true;
    this.loadNotice = false;
    // If a prompt arrived, only show overlay; do not modify iframe or auto message
    // Optionally, we could post initial context here in the future
    // this.postContext({ user: 'demo' });
  }

  // Removed URL modification to avoid disturbing iframe loading

  private autoHideToast() {
    // hide the floating toast after a short delay to avoid covering the chat UI
    setTimeout(() => (this.showPromptToast = false), 5000);
  }

  dismissPromptToast() {
    this.showPromptToast = false;
  }

  minimizePromptToast() {
    this.isMinimized = true;
  }

  expandPromptToast() {
    this.isMinimized = false;
  }

  // Example interop hook for future use
  private postContext(payload: any) {
    const frame = this.agentFrameRef?.nativeElement?.contentWindow;
    if (!frame) return;
    try {
      frame.postMessage({ type: 'hawk-agent-context', payload }, this.agentOrigin === '*' ? '*' : this.agentOrigin);
    } catch {
      // no-op
    }
  }

  async copyPrompt() {
    if (!this.incomingPrompt) return;
    try {
      await navigator.clipboard?.writeText(this.incomingPrompt);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      // ignore
    }
  }

  sendPromptToIframe() {
    if (!this.incomingPrompt) return;
    const frame = this.agentFrameRef?.nativeElement?.contentWindow;
    if (!frame) return;
    const payloads = [
      { type: 'preset_input', text: this.incomingPrompt },
      { type: 'set_input', text: this.incomingPrompt },
      { type: 'prefill', text: this.incomingPrompt },
      { type: 'init_message', text: this.incomingPrompt },
      { event: 'set_input', value: this.incomingPrompt }
    ];
    try {
      const target = this.agentOrigin === '*' ? '*' : this.agentOrigin;
      for (const p of payloads) {
        frame.postMessage(p, target);
      }
    } catch {
      // ignore
    }
  }
}
