import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';

export interface DealBookingRow {
  modified_date: string | null;
  deal_sequence: number | null;
  sell_amount: number | null;
  buy_amount: number | null;
  fx_rate: number | null;
  trade_date: string | null;
  value_date: string | null;
  maturity_date: string | null;
  linked_deal_sequence: number | null;
  triggers_proxy_automation: boolean | null;
  automated_creation: boolean | null;
  parent_deal_sequence: number | null;
  final_hedge_position: boolean | null;
  near_leg_structure: any;
  far_leg_structure: any;
  ndf_structure: any;
  embedded_spot_details: any;
  currency_proxy: any;
  onshore_offshore_basis: number | null;
  swap_points: number | null;
  position_tracking: boolean | null;
  currency_pair: any;
  spot_details: any;
  created_date: string | null;
  embedded_spot_purpose: string | null;
  event_id: string | null;
  ndf_reference: string | null;
  deal_type: string | null;
  system: string | null;
  portfolio: string | null;
  counterparty: string | null;
  sell_currency: string | null;
  buy_currency: string | null;
  target_currency: string | null;
  funding_purpose: string | null;
  swap_structure: string | null;
  proxy_rationale: string | null;
  deal_booking_id: string | null;
  purpose: string | null;
  deal_status: string | null;
  booking_reference: string | null;
  internal_reference: string | null;
  external_reference: string | null;
  comment1: string | null;
  transfer_type: string | null;
  rate_type: string | null;
  proxy_purpose: string | null;
  product_type: string | null;
}

@Injectable({ providedIn: 'root' })
export class DealBookingsService {
  private table = 'deal_bookings';
  private channel: any;

  async list(params?: { search?: string; dealType?: string | null; portfolio?: string | null; tradeDate?: string | null; dealStatus?: string | null }) {
    try {
      const supabase = getSupabase();
      let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
      if (params?.search?.trim()) {
        const s = params.search.trim();
        q = q.or(`deal_booking_id.ilike.%${s}%,internal_reference.ilike.%${s}%,external_reference.ilike.%${s}%,booking_reference.ilike.%${s}%,counterparty.ilike.%${s}%`);
      }
      if (params?.dealType) q = q.eq('deal_type', params.dealType);
      if (params?.portfolio) q = q.eq('portfolio', params.portfolio);
      if (params?.tradeDate) q = q.eq('trade_date', params.tradeDate);
      if (params?.dealStatus) q = q.eq('deal_status', params.dealStatus);
      const { data, error } = await q;
      if (error) throw error;
      return (data as DealBookingRow[]) || [];
    } catch (e) {
      console.error('Failed to load deal_bookings', e);
      return [];
    }
  }

  subscribeRealtime(onChange: () => void) {
    try {
      const supabase = getSupabase();
      this.channel = supabase
        .channel('deal_bookings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription unavailable for deal_bookings', e);
    }
  }
}

