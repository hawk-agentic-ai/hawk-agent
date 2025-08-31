import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';
let PositionsNavService = class PositionsNavService {
    constructor() {
        this.supabase = getSupabase();
        this.table = 'position_nav_master';
    }
    async list(params) {
        let q = this.supabase.from(this.table).select('*');
        if (params?.search?.trim()) {
            const s = params.search.trim();
            q = q.or(`nav_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%,nav_type.ilike.%${s}%,position_type.ilike.%${s}%`);
        }
        q = q.order('as_of_date', { ascending: false }).order('modified_at', { ascending: false, nullsFirst: false });
        const { data, error } = await q;
        if (error)
            throw error;
        return data || [];
    }
    async getById(id) {
        const { data, error } = await this.supabase.from(this.table).select('*').eq('nav_id', id).single();
        if (error)
            throw error;
        return data;
    }
    async updateById(id, payload) {
        const { error } = await this.supabase.from(this.table).update(payload).eq('nav_id', id);
        if (error)
            throw error;
        return true;
    }
    async deleteById(id) {
        const { error } = await this.supabase.from(this.table).delete().eq('nav_id', id);
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
};
PositionsNavService = __decorate([
    Injectable({ providedIn: 'root' })
], PositionsNavService);
export { PositionsNavService };
//# sourceMappingURL=positions-nav.service.js.map