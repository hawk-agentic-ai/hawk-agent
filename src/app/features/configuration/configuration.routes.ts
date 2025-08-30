import { Routes } from '@angular/router';

export const configurationRoutes: Routes = [
  {
    path: 'hedge-framework',
    loadComponent: () => import('./hedge-framework/hedge-framework.component').then(m => m.HedgeFrameworkComponent)
  },
  {
    path: 'entity',
    loadComponent: () => import('./entity/entity.component').then(m => m.EntityComponent)
  },
  {
    path: 'currency',
    loadComponent: () => import('./currency/currency.component').then(m => m.CurrencyComponent)
  },
  {
    path: 'overlay',
    loadComponent: () => import('./overlay/overlay.component').then(m => m.OverlayComponent)
  },
  {
    path: 'picklist',
    loadComponent: () => import('./picklist/picklist.component').then(m => m.PicklistComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./portfolio/portfolio.component').then(m => m.PortfolioComponent)
  },
  // Alias to match menu label "Portfolios"
  {
    path: 'portfolios',
    loadComponent: () => import('./portfolio/portfolio.component').then(m => m.PortfolioComponent)
  },
  // New configuration pages
  {
    path: 'positions-nav',
    loadComponent: () => import('./positions-nav/positions-nav.component').then(m => m.PositionsNavComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'threshold-configuration',
    loadComponent: () => import('./threshold-configuration/threshold-configuration.component').then(m => m.ThresholdConfigurationComponent)
  },
  {
    path: 'buffer-configuration',
    loadComponent: () => import('./buffer-configuration/buffer-configuration.component').then(m => m.BufferConfigurationComponent)
  },
  {
    path: 'business-rules-engine',
    loadComponent: () => import('./business-rules-engine/business-rules-engine.component').then(m => m.BusinessRulesEngineComponent)
  },
  {
    path: 'booking-model-config',
    loadComponent: () => import('./booking-model-config/booking-model-config.component').then(m => m.BookingModelConfigComponent)
  },
  {
    path: '',
    redirectTo: 'entity',
    pathMatch: 'full'
  }
];
