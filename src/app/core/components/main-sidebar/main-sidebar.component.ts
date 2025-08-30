import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="sidenav-root sidebar-transition z-20"
      [class.collapsed]="effectivelyCollapsed"
      [style.width]="effectivelyCollapsed ? '64px' : '290px'"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      style="background-color: #1e293b;">
      
      <!-- Brand Section -->
      <div class="nav-header">
        <div class="header-full" [class.justify-center]="effectivelyCollapsed">
          <div class="logo-box">
            <span>MBS</span>
          </div>
          <div *ngIf="!effectivelyCollapsed" class="flex flex-col">
            <span class="text-sm font-semibold text-white">MBS One Finance Platform</span>
          </div>
        </div>
        
        <div *ngIf="!effectivelyCollapsed" class="section-label" style="color: #e5e7eb !important;">
          <span>Corporate Treasury</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="menu">
        <div class="menu-block">
          <!-- Main Menu Item -->
          <button 
            class="menu-button" 
            [class.active]="activeMenu === 'hedge-accounting'"
            (click)="toggleGroup(); onMenuItemClick({key: 'hedge-accounting', label: 'Hedge Accounting SFX'})"
            style="color: #e5e7eb !important;">
            <div class="icon-text">
              <i class="pi pi-chart-line" [class.mr-0]="effectivelyCollapsed"></i>
              <span *ngIf="!effectivelyCollapsed">Hedge Accounting SFX</span>
            </div>
            <i *ngIf="!effectivelyCollapsed" class="pi text-xs" [class.pi-chevron-down]="groupExpanded" [class.pi-chevron-right]="!groupExpanded"></i>
          </button>

          <!-- Submenu Items (only visible when expanded) -->
          <div *ngIf="!effectivelyCollapsed && groupExpanded" class="submenu">
            <a routerLink="/hedge/dashboard" 
               routerLinkActive="active"
               (click)="onMenuItemClick({key: 'dashboard', label: 'Analytics'})"
               style="color: #e5e7eb !important;">
              <i class="pi pi-th-large mr-3"></i>
              Analytics
            </a>
            <a 
              [class.active]="isRouteActive('/configuration')"
              (click)="onMenuItemClick({key: 'configuration', label: 'Configuration'})"
              style="color: #e5e7eb !important;">
              <i class="pi pi-cog mr-3"></i>
              Configuration
            </a>
            <a routerLink="/operations" 
               routerLinkActive="active"
               (click)="onMenuItemClick({key: 'operations', label: 'Operations'})"
               style="color: #e5e7eb !important;">
              <i class="pi pi-briefcase mr-3"></i>
              Operations
            </a>
            <a routerLink="/hedge/reports" 
               routerLinkActive="active"
               (click)="onMenuItemClick({key: 'reports', label: 'Reports'})"
               style="color: #e5e7eb !important;">
              <i class="pi pi-file-pdf mr-3"></i>
              Reports
            </a>
            <a routerLink="/hawk-agent" 
               routerLinkActive="active"
               (click)="onMenuItemClick({key: 'hawk-agent', label: 'HAWK Agent'})"
               style="color: #e5e7eb !important;">
              <i class="pi pi-microchip-ai mr-3"></i>
              HAWK Agent
            </a>
            <a routerLink="/audit" 
               routerLinkActive="active"
               (click)="onMenuItemClick({key: 'audit', label: 'Audit & System Logs'})"
               style="color: #e5e7eb !important;">
              <i class="pi pi-history mr-3"></i>
              Audit & System Logs
            </a>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="nav-footer">
        <!-- Collapse Toggle -->
        <button 
          (click)="toggleCollapse.emit()"
          class="menu-button justify-center"
          style="color: #e5e7eb !important;">
          <i class="pi" [class.pi-angle-left]="!effectivelyCollapsed" [class.pi-angle-right]="effectivelyCollapsed"></i>
        </button>

        <!-- Notification Button -->
        <button class="menu-button justify-center relative" style="color: #e5e7eb !important;">
          <i class="pi pi-bell"></i>
          <span class="absolute top-0 right-3 transform translate-x-1/3 -translate-y-1/3 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Profile -->
        <div class="profile" style="color: #e5e7eb !important;">
          <div class="profile-pic">
            <span>SL</span>
          </div>
          <span *ngIf="!effectivelyCollapsed">Sensie Larusso</span>
        </div>
      </div>
    </aside>
  `
})
export class MainSidebarComponent implements OnInit, OnChanges {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<any>();

  activeMenu: string = 'hedge-accounting';
  groupExpanded: boolean = true;
  effectivelyCollapsed: boolean = false;

  constructor(private router: Router, private layoutService: LayoutService) {
    // Update effective collapsed state based on both collapsed and hover states
    this.updateEffectiveCollapsedState();
  }

  ngOnInit() {
    this.updateEffectiveCollapsedState();
  }

  ngOnChanges() {
    this.updateEffectiveCollapsedState();
  }

  private updateEffectiveCollapsedState() {
    this.effectivelyCollapsed = this.layoutService.isMainSidebarEffectivelyCollapsed();
  }

  onMouseEnter() {
    this.layoutService.setMainSidebarHovered(true);
    this.updateEffectiveCollapsedState();
  }

  onMouseLeave() {
    this.layoutService.setMainSidebarHovered(false);
    this.updateEffectiveCollapsedState();
  }

  onMenuItemClick(menuItem: any) {
    this.activeMenu = menuItem.key;
    this.layoutService.setNavigationInProgress(true);
    this.menuItemClick.emit(menuItem);
    
    // Complete navigation after a short delay to allow route change
    setTimeout(() => {
      this.layoutService.completeNavigation();
      this.updateEffectiveCollapsedState();
    }, 1000);
  }

  toggleGroup() {
    this.groupExpanded = !this.groupExpanded;
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
