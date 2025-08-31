import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';
let AllocationEngineService = class AllocationEngineService {
    constructor() {
        this.table = 'allocation_engine';
    }
    async list(params) {
        try {
            const supabase = getSupabase();
            let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
            if (params?.search?.trim()) {
                const s = params.search.trim();
                q = q.or(`allocation_id.ilike.%${s}%,request_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%`);
            }
            if (params?.status)
                q = q.eq('allocation_status', params.status);
            if (params?.executionDate)
                q = q.eq('execution_date', params.executionDate);
            if (params?.navType)
                q = q.eq('nav_type', params.navType);
            const { data, error } = await q;
            if (error)
                throw error;
            return data || [];
        }
        catch (e) {
            console.error('Failed to load allocation_engine', e);
            return [];
        }
    }
    subscribeRealtime(onChange) {
        try {
            const supabase = getSupabase();
            this.channel = supabase
                .channel('allocation_engine_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
                .subscribe();
        }
        catch (e) {
            console.warn('Realtime subscription unavailable for allocation_engine', e);
        }
    }
};
AllocationEngineService = __decorate([
    Injectable({ providedIn: 'root' })
], AllocationEngineService);
export { AllocationEngineService };
//# sourceMappingURL=allocation-engine.service.js.map