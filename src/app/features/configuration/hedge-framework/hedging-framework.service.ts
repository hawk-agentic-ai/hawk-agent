import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';

export type HedgingFrameworkRow = {
  framework_id: string;
  framework_type: string | null;
  hedging_state: string | null;
  currency_code: string | null;
  entity_id: string | null;
  hedge_ratio: number | null;
  effectiveness_threshold_lower: number | null;
  effectiveness_threshold_upper: number | null;
  minimum_hedge_amount: number | null;
  maximum_hedge_amount: number | null;
  buffer_percentage: number | null;
  effective_date: string | null;
  expiry_date: string | null;
  period: string | null;
  accounting_method: string | null;
  rebalancing_frequency: string | null;
  car_exemption_override: string | null;
  active_flag: string | null; // 'Y'/'N' or similar
  notes: string | null;
  created_by?: string | null;
  created_date?: string | null;
  modified_by?: string | null;
  modified_date?: string | null;
};

@Injectable({ providedIn: 'root' })
export class HedgingFrameworkService {
  private supabase = getSupabase();
  private table = 'hedging_framework';

  async list(params?: { search?: string; type?: string | null; active?: string | null }) {
    let q = this.supabase.from(this.table).select('*');
    if (params?.search?.trim()) {
      const s = params.search.trim();
      q = q.or(`framework_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%`);
    }
    if (params?.type) q = q.eq('framework_type', params.type);
    if (params?.active) q = q.eq('active_flag', params.active);
    q = q.order('modified_date', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as HedgingFrameworkRow[]) || [];
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.from(this.table).select('*').eq('framework_id', id).single();
    if (error) throw error;
    return data as HedgingFrameworkRow;
  }

  async updateById(id: string, payload: Partial<HedgingFrameworkRow>) {
    const { error } = await this.supabase.from(this.table).update(payload).eq('framework_id', id);
    if (error) throw error;
    return true;
  }

  async insert(row: HedgingFrameworkRow) {
    const { error } = await this.supabase.from(this.table).insert(row);
    if (error) throw error;
    return true;
  }

  async deleteById(id: string) {
    const { error } = await this.supabase.from(this.table).delete().eq('framework_id', id);
    if (error) throw error;
    return true;
  }
}
