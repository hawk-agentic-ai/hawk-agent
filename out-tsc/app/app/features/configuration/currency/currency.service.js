import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';
let CurrencyService = class CurrencyService {
    constructor() {
        this.supabase = getSupabase();
        this.table = 'currency_configuration';
    }
    async list(params) {
        let q = this.supabase.from(this.table).select('*');
        if (params?.search) {
            const s = params.search.trim();
            if (s) {
                // ilike on code or name
                q = q.or(`currency_code.ilike.%${s}%,currency_name.ilike.%${s}%`);
            }
        }
        if (params?.type) {
            q = q.eq('currency_type', params.type);
        }
        if (params?.active != null) {
            q = q.eq('active_flag', params.active);
        }
        q = q.order('currency_code', { ascending: true });
        const { data, error } = await q;
        if (error)
            throw error;
        return data || [];
    }
    async getByCode(code) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('currency_code', code)
            .single();
        if (error)
            throw error;
        return data;
    }
    async updateByCode(code, payload) {
        const { error } = await this.supabase
            .from(this.table)
            .update(payload)
            .eq('currency_code', code);
        if (error)
            throw error;
        return true;
    }
    async deleteByCode(code) {
        const { error } = await this.supabase
            .from(this.table)
            .delete()
            .eq('currency_code', code);
        if (error)
            throw error;
        return true;
    }
};
CurrencyService = __decorate([
    Injectable({ providedIn: 'root' })
], CurrencyService);
export { CurrencyService };
//# sourceMappingURL=currency.service.js.map