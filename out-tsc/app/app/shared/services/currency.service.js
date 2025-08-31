import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
let CurrencyService = class CurrencyService {
    constructor(http) {
        this.http = http;
        // Mock currency config data - in real implementation, this would come from database
        this.mockCurrencyConfig = [
            { id: '1', currencyCode: 'SGD', currencyName: 'Singapore Dollar', isActive: true, priority: 1 },
            { id: '2', currencyCode: 'USD', currencyName: 'US Dollar', isActive: true, priority: 2 },
            { id: '3', currencyCode: 'EUR', currencyName: 'Euro', isActive: true, priority: 3 },
            { id: '4', currencyCode: 'GBP', currencyName: 'British Pound', isActive: true, priority: 4 },
            { id: '5', currencyCode: 'JPY', currencyName: 'Japanese Yen', isActive: true, priority: 5 },
            { id: '6', currencyCode: 'AUD', currencyName: 'Australian Dollar', isActive: true, priority: 6 },
            { id: '7', currencyCode: 'HKD', currencyName: 'Hong Kong Dollar', isActive: true, priority: 7 },
            { id: '8', currencyCode: 'CNY', currencyName: 'Chinese Yuan', isActive: true, priority: 8 },
            { id: '9', currencyCode: 'INR', currencyName: 'Indian Rupee', isActive: true, priority: 9 },
            { id: '10', currencyCode: 'KRW', currencyName: 'South Korean Won', isActive: true, priority: 10 },
            { id: '11', currencyCode: 'TWD', currencyName: 'Taiwan Dollar', isActive: true, priority: 11 },
            { id: '12', currencyCode: 'THB', currencyName: 'Thai Baht', isActive: true, priority: 12 },
            { id: '13', currencyCode: 'MYR', currencyName: 'Malaysian Ringgit', isActive: true, priority: 13 },
            { id: '14', currencyCode: 'CAD', currencyName: 'Canadian Dollar', isActive: true, priority: 14 },
            { id: '15', currencyCode: 'CHF', currencyName: 'Swiss Franc', isActive: true, priority: 15 }
        ];
    }
    /**
     * Fetches currency codes from currency config table
     * In real implementation, this would make HTTP call to backend API
     */
    getCurrencyCodes() {
        // Mock implementation - replace with actual API call
        return of(this.mockCurrencyConfig)
            .pipe(delay(300), // Simulate network delay
        map(configs => configs
            .filter(config => config.isActive)
            .sort((a, b) => a.priority - b.priority)
            .map(config => config.currencyCode)));
    }
    /**
     * Fetches full currency config data
     */
    getCurrencyConfigs() {
        // Mock implementation - replace with actual API call
        return of(this.mockCurrencyConfig)
            .pipe(delay(300), map(configs => configs.filter(config => config.isActive)));
    }
};
CurrencyService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], CurrencyService);
export { CurrencyService };
//# sourceMappingURL=currency.service.js.map