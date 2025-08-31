import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';
let HedgeInstructionsService = class HedgeInstructionsService {
    constructor() {
        this.table = 'hedge_instructions';
    }
    async list(params) {
        try {
            const supabase = getSupabase();
            let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
            if (params?.search?.trim()) {
                const s = params.search.trim();
                q = q.or(`instruction_id.ilike.%${s}%,msg_uid.ilike.%${s}%,instruction_status.ilike.%${s}%,portfolio_code.ilike.%${s}%`);
            }
            if (params?.status)
                q = q.eq('instruction_status', params.status);
            if (params?.portfolio)
                q = q.eq('portfolio_code', params.portfolio);
            if (params?.fromDate)
                q = q.gte('instruction_date', params.fromDate);
            if (params?.toDate)
                q = q.lte('instruction_date', params.toDate);
            const { data, error } = await q;
            if (error)
                throw error;
            return data || [];
        }
        catch (e) {
            console.error('Failed to load hedge_instructions', e);
            return [];
        }
    }
    subscribeRealtime(onChange) {
        try {
            const supabase = getSupabase();
            this.channel = supabase
                .channel('hedge_instructions_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
                .subscribe();
        }
        catch (e) {
            console.warn('Realtime subscription unavailable for hedge_instructions', e);
        }
    }
    async add(payload) {
        const supabase = getSupabase();
        const { error } = await supabase.from(this.table).insert([payload]);
        if (error)
            throw error;
    }
    async updateById(instruction_id, changes) {
        const supabase = getSupabase();
        const { error } = await supabase.from(this.table).update(changes).eq('instruction_id', instruction_id);
        if (error)
            throw error;
    }
    async deleteById(instruction_id) {
        const supabase = getSupabase();
        const { error } = await supabase.from(this.table).delete().eq('instruction_id', instruction_id);
        if (error)
            throw error;
    }
};
HedgeInstructionsService = __decorate([
    Injectable({ providedIn: 'root' })
], HedgeInstructionsService);
export { HedgeInstructionsService };
//# sourceMappingURL=hedge-instructions.service.js.map