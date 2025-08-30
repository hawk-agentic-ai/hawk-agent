import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  template: `
    <div class="dashboard-container">
      <!-- Page Header -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Hedge Accounting Dashboard</h2>
        <p class="text-gray-600">Overview of hedge accounting positions and performance metrics</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="pi pi-dollar text-2xl text-blue-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Hedged</p>
              <p class="text-2xl font-bold text-gray-900">$2.4B</p>
              <p class="text-sm text-green-600">+5.2% from last month</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="pi pi-chart-line text-2xl text-green-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Hedge Effectiveness</p>
              <p class="text-2xl font-bold text-gray-900">98.7%</p>
              <p class="text-sm text-green-600">Within range</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="pi pi-building text-2xl text-purple-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Entities</p>
              <p class="text-2xl font-bold text-gray-900">24</p>
              <p class="text-sm text-blue-600">Across 8 countries</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-2xl text-orange-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Risk Alerts</p>
              <p class="text-2xl font-bold text-gray-900">3</p>
              <p class="text-sm text-orange-600">Require attention</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Hedge Ratio by Currency Chart -->
        <p-card header="Hedge Ratio by Currency" class="chart-card">
          <p-chart 
            type="doughnut" 
            [data]="currencyChartData" 
            [options]="chartOptions"
            class="w-full h-80">
          </p-chart>
        </p-card>

        <!-- Monthly Hedge Performance Chart -->
        <p-card header="Monthly Hedge Performance" class="chart-card">
          <p-chart 
            type="line" 
            [data]="performanceChartData" 
            [options]="lineChartOptions"
            class="w-full h-80">
          </p-chart>
        </p-card>
      </div>

      <!-- Recent Activities -->
      <div class="mt-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let activity of recentActivities" class="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-md">
                <div class="flex-shrink-0">
                  <i [class]="activity.icon + ' text-lg'" [ngClass]="activity.iconColor"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-600">{{ activity.description }}</p>
                </div>
                <div class="text-sm text-gray-500">
                  {{ activity.timestamp }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currencyChartData: any;
  performanceChartData: any;
  chartOptions: any;
  lineChartOptions: any;
  recentActivities: any[] = [];

  ngOnInit() {
    this.initializeChartData();
    this.loadRecentActivities();
  }

  initializeChartData() {
    this.currencyChartData = {
      labels: ['USD', 'EUR', 'SGD', 'JPY', 'GBP'],
      datasets: [
        {
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    this.performanceChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Hedge Effectiveness %',
          data: [98.2, 97.8, 98.5, 98.9, 98.1, 98.7],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

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
          beginAtZero: false,
          min: 95,
          max: 100
        }
      }
    };
  }

  loadRecentActivities() {
    this.recentActivities = [
      {
        title: 'New hedge relationship established',
        description: 'EUR/USD forward contract for Entity ABC',
        timestamp: '2 hours ago',
        icon: 'pi pi-plus-circle',
        iconColor: 'text-green-600'
      },
      {
        title: 'Hedge effectiveness test completed',
        description: 'All tests passed for Q4 2024',
        timestamp: '4 hours ago',
        icon: 'pi pi-check-circle',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Risk threshold exceeded',
        description: 'GBP exposure in London branch',
        timestamp: '6 hours ago',
        icon: 'pi pi-exclamation-triangle',
        iconColor: 'text-orange-600'
      },
      {
        title: 'Monthly report generated',
        description: 'Hedge accounting summary for November',
        timestamp: '1 day ago',
        icon: 'pi pi-file-pdf',
        iconColor: 'text-purple-600'
      }
    ];
  }
}