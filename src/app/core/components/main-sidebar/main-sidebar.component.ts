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
          <div class="logo-box flex items-center justify-center" style="width: 36px; height: 36px;">
            <!-- Inline DBS Logomark (original) -->
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="DBS Logo">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2047 11.9981V11.9963C22.2047 10.4209 22.2685 9.00862 23.4371 6.52802C23.7749 5.80636 24.5224 4.7549 23.4212 3.5279C22.5265 2.63602 21.5104 2.7823 20.8259 3.17682C21.2196 2.49239 21.3659 1.47196 20.4721 0.576538C19.2459 -0.521024 18.1908 0.224573 17.4726 0.564126C14.989 1.73527 13.5837 1.79999 12.0028 1.79999C10.4157 1.79999 9.00855 1.73527 6.53034 0.564126C5.80861 0.224573 4.74905 -0.521024 3.52635 0.576538C2.6326 1.47196 2.78333 2.49239 3.17701 3.17682C2.49074 2.78053 1.47286 2.63602 0.577332 3.5279C-0.523009 4.7549 0.22799 5.80636 0.559599 6.52802C1.73531 9.00862 1.80003 10.4209 1.80003 11.9981C1.80003 13.5797 1.73531 14.9956 0.559599 17.4744C0.22799 18.1907 -0.523009 19.2493 0.577332 20.4754C1.47286 21.3646 2.49074 21.2174 3.17701 20.8274C2.78333 21.5136 2.6326 22.5313 3.52635 23.4179C4.74905 24.5234 5.80861 23.7761 6.53034 23.4365C9.01032 22.2662 10.4157 22.2042 12.0028 22.2042C13.5837 22.2042 14.989 22.2662 17.4717 23.4365C18.1908 23.7761 19.2459 24.5234 20.4721 23.4179C21.3659 22.5313 21.216 21.5136 20.8241 20.8274C21.5104 21.2174 22.5265 21.3699 23.4212 20.4754C24.5224 19.2493 23.7749 18.1907 23.4371 17.4744C22.2685 14.992 22.2047 13.5797 22.2047 11.9981Z" fill="#FF3E3E"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.4168 19.4405L13.6569 14.6103C13.6569 14.6103 12.8766 13.8485 12.0014 13.8485C11.1174 13.8485 10.3372 14.6103 10.3372 14.6103L4.579 19.4405L4.56055 19.4239L9.39167 13.6639C9.39167 13.6639 10.1518 12.8863 10.1518 12.0005C10.1518 11.1236 9.39167 10.3451 9.39167 10.3451L4.56055 4.58076L4.579 4.56055L10.3372 9.39606C10.3372 9.39606 11.1174 10.1597 12.0014 10.1597C12.8766 10.1597 13.6569 9.39606 13.6569 9.39606L19.4168 4.56055L19.4405 4.58603L14.5998 10.3451C14.5998 10.3451 13.8449 11.1236 13.8449 12.0005C13.8449 12.8863 14.5998 13.6639 14.5998 13.6639L19.4405 19.4221L19.4168 19.4405Z" fill="white"/>
            </svg>
          </div>
          <div *ngIf="!effectivelyCollapsed" class="flex flex-col">
            <span class="text-sm font-semibold text-white">DBS One Finance Platform</span>
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
