import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';

export interface AllocationRow {
  modified_date: string | null;
  buffer_percentage: number | null;
  buffer_amount: number | null;
  hedged_position: number | null;
  unhedged_position: number | null;
  hedge_amount_allocation: number | null;
  available_amount_for_hedging: number | null;
  waterfall_priority: number | null;
  allocation_sequence: number | null;
  execution_date: string | null;
  created_date: string | null;
  sfx_position: number | null;
  car_amount_distribution: number | null;
  manual_overlay_amount: number | null;
  request_id: string | null;
  entity_id: string | null;
  currency_code: string | null;
  nav_type: string | null;
  allocation_id: string | null;
  car_exemption_flag: string | null;
  allocation_status: string | null;
  modified_by: string | null;
  notes: string | null;
  created_by: string | null;
}

@Injectable({ providedIn: 'root' })
export class AllocationEngineService {
  private table = 'allocation_engine';
  private channel: any;

  async list(params?: { search?: string; status?: string | null; executionDate?: string | null; navType?: string | null }) {
    try {
      const supabase = getSupabase();
      let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
      if (params?.search?.trim()) {
        const s = params.search.trim();
        q = q.or(`allocation_id.ilike.%${s}%,request_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%`);
      }
      if (params?.status) q = q.eq('allocation_status', params.status);
      if (params?.executionDate) q = q.eq('execution_date', params.executionDate);
      if (params?.navType) q = q.eq('nav_type', params.navType);
      const { data, error } = await q;
      if (error) throw error;
      return (data as AllocationRow[]) || [];
    } catch (e) {
      console.error('Failed to load allocation_engine', e);
      return [];
    }
  }

  subscribeRealtime(onChange: () => void) {
    try {
      const supabase = getSupabase();
      this.channel = supabase
        .channel('allocation_engine_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription unavailable for allocation_engine', e);
    }
  }
}

