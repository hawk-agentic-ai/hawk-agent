import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
let DashboardComponent = class DashboardComponent {
    constructor(dashboardService, activityTracker, router) {
        this.dashboardService = dashboardService;
        this.activityTracker = activityTracker;
        this.router = router;
        this.recentActivities = [];
        // KPIs
        this.totalHedged = 0;
        this.totalHedgedDisplay = '$0';
        this.hedgeEffectiveness = 0;
        this.activeEntities = 0;
        this.riskAlerts = 0;
        this.kpiCards = [];
        // Currency filtering
        this.availableCurrencies = [];
        this.selectedCurrency = null;
        this.allMetricsData = null;
    }
    ngOnInit() {
        this.initializeChartOptions();
        // Initialize services
        this.dashboardService.init();
        this.activityTracker.init();
        // Subscribe to data streams
        this.dashboardService.metrics$.subscribe((m) => {
            if (!m)
                return;
            this.allMetricsData = m;
            this.updateAvailableCurrencies(m);
            this.applyMetrics(m);
        });
        this.activityTracker.activities$.subscribe((activities) => {
            this.recentActivities = activities;
        });
    }
    ngOnDestroy() {
        this.activityTracker.destroy();
        this.dashboardService.destroy();
    }
    initializeChartOptions() {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
        this.lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    }
    applyMetrics(m) {
        this.totalHedged = m.totalHedged;
        this.totalHedgedDisplay = this.formatCurrency(m.totalHedged);
        this.hedgeEffectiveness = m.hedgeEffectiveness;
        this.activeEntities = m.activeEntities;
        this.riskAlerts = m.riskAlerts;
        // Update KPI Cards array for the template
        this.kpiCards = [
            {
                title: 'Total Hedged',
                value: this.totalHedgedDisplay,
                icon: 'pi pi-dollar',
                change: (m.totalHedgedChangePct ?? 0) >= 0 ? `+${m.totalHedgedChangePct?.toFixed(1)}%` : `${m.totalHedgedChangePct?.toFixed(1)}%`,
                changeType: (m.totalHedgedChangePct ?? 0) >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Hedge Effectiveness',
                value: `${m.hedgeEffectiveness.toFixed(1)}%`,
                icon: 'pi pi-chart-line',
                change: (m.hedgeEffectivenessChangePct ?? 0) >= 0 ? `+${m.hedgeEffectivenessChangePct?.toFixed(1)}%` : `${m.hedgeEffectivenessChangePct?.toFixed(1)}%`,
                changeType: (m.hedgeEffectivenessChangePct ?? 0) >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Active Entities',
                value: m.activeEntities.toString(),
                icon: 'pi pi-building',
                change: (m.activeEntitiesChange ?? 0) > 0 ? `+${m.activeEntitiesChange}` : `${m.activeEntitiesChange ?? 0}`,
                changeType: (m.activeEntitiesChange ?? 0) === 0 ? 'neutral' : (m.activeEntitiesChange ?? 0) > 0 ? 'positive' : 'negative'
            },
            {
                title: 'Risk Alerts',
                value: m.riskAlerts.toString(),
                icon: 'pi pi-exclamation-triangle',
                change: (m.riskAlertsChange ?? 0) > 0 ? `+${m.riskAlertsChange}` : `${m.riskAlertsChange ?? 0}`,
                changeType: (m.riskAlertsChange ?? 0) > 0 ? 'negative' : (m.riskAlertsChange ?? 0) < 0 ? 'positive' : 'neutral'
            }
        ];
        // Doughnut chart from currency breakdown
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
        this.currencyChartData = {
            labels: m.currencyBreakdown.map(x => x.label),
            datasets: [{
                    data: m.currencyBreakdown.map(x => Math.abs(x.value)),
                    backgroundColor: colors.slice(0, m.currencyBreakdown.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
        };
        // Position Value Over Time Chart
        this.positionValueChartData = {
            labels: m.positionValueOverTime.map(x => x.label),
            datasets: [{
                    label: 'Position Value (USD)',
                    data: m.positionValueOverTime.map(x => x.value),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
        };
        // NAV vs Position Comparison Chart
        this.navVsPositionChartData = {
            labels: m.navVsPosition.map(x => x.label),
            datasets: [{
                    label: 'NAV',
                    data: m.navVsPosition.map(x => x.nav),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }, {
                    label: 'Position',
                    data: m.navVsPosition.map(x => x.position),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)'
                }]
        };
        // Entity Exposure Distribution Chart
        this.entityExposureChartData = {
            labels: m.entityExposure.map(x => x.label),
            datasets: [{
                    label: 'Exposure (USD)',
                    data: m.entityExposure.map(x => x.value),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
                    ]
                }]
        };
        // Hedge Coverage Ratio Trend Chart
        this.hedgeCoverageChartData = {
            labels: m.hedgeCoverageRatio.map(x => x.label),
            datasets: [{
                    label: 'Coverage Ratio %',
                    data: m.hedgeCoverageRatio.map(x => x.value),
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
        };
        // Position Status Distribution Chart
        this.positionStatusChartData = {
            labels: m.positionStatusDistribution.map(x => x.label),
            datasets: [{
                    data: m.positionStatusDistribution.map(x => x.value),
                    backgroundColor: m.positionStatusDistribution.map(x => x.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
        };
    }
    updateAvailableCurrencies(m) {
        // Extract unique currencies from currency breakdown
        const currencies = m.currencyBreakdown.map(c => c.label);
        this.availableCurrencies = [
            { label: 'All Currencies', value: null },
            ...currencies.map(currency => ({ label: currency, value: currency }))
        ];
        // Set default selection if not already set
        if (!this.selectedCurrency) {
            this.selectedCurrency = this.availableCurrencies[0];
        }
    }
    onCurrencyChange() {
        if (this.allMetricsData) {
            this.refreshChartsWithFilter();
        }
    }
    refreshChartsWithFilter() {
        if (!this.allMetricsData)
            return;
        const selectedCurrency = this.selectedCurrency?.value;
        // Refresh data with currency filter
        this.dashboardService.refreshWithCurrencyFilter(selectedCurrency);
    }
    formatCurrency(n) {
        // Compact currency for display
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
        }
        catch {
            return `$${(n / 1_000_000).toFixed(1)}M`;
        }
    }
    // Optional view handler for Recent Activities action button
    viewRow(activity) {
        try {
            // If an external link is provided, prefer to open it
            const link = activity?.metadata?.link;
            if (link) {
                window.open(link, '_blank');
                return;
            }
        }
        catch { }
        // Navigate to Prompt History with deep-link by msg_uid or instruction_id
        const meta = activity?.metadata || {};
        const queryParams = {};
        if (meta.msg_uid || activity.msg_uid)
            queryParams.msg_uid = meta.msg_uid || activity.msg_uid;
        if (meta.instruction_id || activity.instruction_id)
            queryParams.instruction_id = meta.instruction_id || activity.instruction_id;
        this.router.navigate(['/hawk-agent/prompt-history'], { queryParams });
    }
};
DashboardComponent = __decorate([
    Component({
        selector: 'app-dashboard',
        standalone: true,
        imports: [CommonModule, FormsModule, ChartModule, CardModule, DropdownModule],
        templateUrl: './dashboard.component.html',
        styleUrls: ['./dashboard.component.css']
    })
], DashboardComponent);
export { DashboardComponent };
//# sourceMappingURL=dashboard.component.js.map