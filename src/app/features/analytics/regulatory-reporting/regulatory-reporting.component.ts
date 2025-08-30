import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regulatory-reporting-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Regulatory Reporting</h2>
        <p class="text-gray-600">Analytics overview for regulatory reporting</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6 text-gray-500">Coming soon</div>
    </div>
  `
})
export class RegulatoryReportingComponent {}

