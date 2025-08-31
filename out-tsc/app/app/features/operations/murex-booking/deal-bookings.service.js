import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';
let DealBookingsService = class DealBookingsService {
    constructor() {
        this.table = 'deal_bookings';
    }
    async list(params) {
        try {
            const supabase = getSupabase();
            let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
            if (params?.search?.trim()) {
                const s = params.search.trim();
                q = q.or(`deal_booking_id.ilike.%${s}%,internal_reference.ilike.%${s}%,external_reference.ilike.%${s}%,booking_reference.ilike.%${s}%,counterparty.ilike.%${s}%`);
            }
            if (params?.dealType)
                q = q.eq('deal_type', params.dealType);
            if (params?.portfolio)
                q = q.eq('portfolio', params.portfolio);
            if (params?.tradeDate)
                q = q.eq('trade_date', params.tradeDate);
            if (params?.dealStatus)
                q = q.eq('deal_status', params.dealStatus);
            const { data, error } = await q;
            if (error)
                throw error;
            return data || [];
        }
        catch (e) {
            console.error('Failed to load deal_bookings', e);
            return [];
        }
    }
    subscribeRealtime(onChange) {
        try {
            const supabase = getSupabase();
            this.channel = supabase
                .channel('deal_bookings_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
                .subscribe();
        }
        catch (e) {
            console.warn('Realtime subscription unavailable for deal_bookings', e);
        }
    }
};
DealBookingsService = __decorate([
    Injectable({ providedIn: 'root' })
], DealBookingsService);
export { DealBookingsService };
//# sourceMappingURL=deal-bookings.service.js.map