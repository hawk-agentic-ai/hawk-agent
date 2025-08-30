import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sub-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="sidenav-root sub-sidenav sidebar-transition z-30"
      style="background-color: #ffffff !important; position: fixed; top: 0; bottom: 0; box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);"
      [style.left]="effectiveMainSidebarWidth"
      [style.width]="effectivelyCollapsed ? '64px' : '240px'"
      [class.collapsed]="effectivelyCollapsed"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()">
      
      <!-- Header -->
      <div class="nav-header">
        <div class="header-full" [class.justify-center]="effectivelyCollapsed">
          <i [class]="icon || 'pi pi-cog'" class="text-lg text-gray-800"></i>
          <span *ngIf="!effectivelyCollapsed" class="text-sm font-semibold text-gray-800">{{ title || 'Configuration' }}</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="menu">
        <div *ngFor="let item of menuItems" class="menu-block">
          <a 
            [routerLink]="item.link || ['/configuration', item.key]"
            routerLinkActive="active menu-button-active"
            [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
            class="menu-button"
            [title]="effectivelyCollapsed ? item.label : ''"
            (click)="onMenuItemClick(item)">
            <div class="icon-text">
              <i [ngClass]="item.icon" [class.mr-0]="effectivelyCollapsed"></i>
              <span *ngIf="!effectivelyCollapsed">{{ item.label }}</span>
            </div>
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="nav-footer">
        <!-- Collapse Toggle -->
        <button 
          (click)="toggleCollapse.emit()"
          class="menu-button justify-center"
          style="color: #334155 !important;">
          <i class="pi" [class.pi-angle-left]="effectivelyCollapsed" [class.pi-angle-right]="!effectivelyCollapsed"></i>
        </button>
      </div>
    </aside>
  `
})
export class SubSidebarComponent implements OnInit, OnChanges {
  @Input() isCollapsed = false;
  @Input() isMainSidebarCollapsed = false;
  @Input() menuItems: any[] = [];
  @Input() title: string = 'Configuration';
  @Input() icon: string = 'pi pi-cog';
  @Output() toggleCollapse = new EventEmitter<void>();

  effectivelyCollapsed: boolean = false;
  effectiveMainSidebarWidth: string = '290px';

  // Track active submenu item using the Router
  constructor(private router: Router, private layoutService: LayoutService) {
    this.updateEffectiveStates();
  }

  ngOnInit() {
    this.updateEffectiveStates();
  }

  ngOnChanges() {
    this.updateEffectiveStates();
  }

  private updateEffectiveStates() {
    this.effectivelyCollapsed = this.layoutService.isSubSidebarEffectivelyCollapsed();
    this.effectiveMainSidebarWidth = this.layoutService.isMainSidebarEffectivelyCollapsed() ? '64px' : '290px';
  }

  onMouseEnter() {
    this.layoutService.setSubSidebarHovered(true);
    this.updateEffectiveStates();
  }

  onMouseLeave() {
    this.layoutService.setSubSidebarHovered(false);
    this.updateEffectiveStates();
  }

  isSubMenuActive(key: string): boolean {
    return this.router.url.includes(`/configuration/${key}`);
  }

  onMenuItemClick(item: any) {
    this.layoutService.setNavigationInProgress(true);
    
    // Complete navigation after a short delay to allow route change
    setTimeout(() => {
      this.layoutService.completeNavigation();
      this.updateEffectiveStates();
    }, 1000);
  }
}
