import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';
let HedgingFrameworkService = class HedgingFrameworkService {
    constructor() {
        this.supabase = getSupabase();
        this.table = 'hedging_framework';
    }
    async list(params) {
        let q = this.supabase.from(this.table).select('*');
        if (params?.search?.trim()) {
            const s = params.search.trim();
            q = q.or(`framework_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%`);
        }
        if (params?.type)
            q = q.eq('framework_type', params.type);
        if (params?.active)
            q = q.eq('active_flag', params.active);
        q = q.order('modified_date', { ascending: false });
        const { data, error } = await q;
        if (error)
            throw error;
        return data || [];
    }
    async getById(id) {
        const { data, error } = await this.supabase.from(this.table).select('*').eq('framework_id', id).single();
        if (error)
            throw error;
        return data;
    }
    async updateById(id, payload) {
        const { error } = await this.supabase.from(this.table).update(payload).eq('framework_id', id);
        if (error)
            throw error;
        return true;
    }
    async insert(row) {
        const { error } = await this.supabase.from(this.table).insert(row);
        if (error)
            throw error;
        return true;
    }
    async deleteById(id) {
        const { error } = await this.supabase.from(this.table).delete().eq('framework_id', id);
        if (error)
            throw error;
        return true;
    }
};
HedgingFrameworkService = __decorate([
    Injectable({ providedIn: 'root' })
], HedgingFrameworkService);
export { HedgingFrameworkService };
//# sourceMappingURL=hedging-framework.service.js.map