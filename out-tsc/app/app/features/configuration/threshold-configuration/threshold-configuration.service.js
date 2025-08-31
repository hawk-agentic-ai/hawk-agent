import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from 'src/app/core/data/supabase.client';
let ThresholdConfigurationService = class ThresholdConfigurationService {
    constructor() {
        this.thresholdSubject = new BehaviorSubject([]);
        this.thresholds$ = this.thresholdSubject.asObservable();
        this.supabase = getSupabase();
        this.fetchThresholds();
        this.subscribeRealtime();
    }
    async fetchThresholds() {
        const { data, error } = await this.supabase.from('threshold_configuration').select('*');
        if (!error && data) {
            this.thresholdSubject.next(data);
        }
    }
    subscribeRealtime() {
        this.channel = this.supabase.channel('threshold_configuration_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'threshold_configuration' }, (payload) => {
            this.fetchThresholds();
        })
            .subscribe();
    }
    async addThreshold(threshold) {
        await this.supabase.from('threshold_configuration').insert([threshold]);
    }
    async updateThreshold(threshold_id, changes) {
        await this.supabase.from('threshold_configuration').update(changes).eq('threshold_id', threshold_id);
    }
    async deleteThreshold(threshold_id) {
        await this.supabase.from('threshold_configuration').delete().eq('threshold_id', threshold_id);
    }
};
ThresholdConfigurationService = __decorate([
    Injectable({ providedIn: 'root' })
], ThresholdConfigurationService);
export { ThresholdConfigurationService };
//# sourceMappingURL=threshold-configuration.service.js.map