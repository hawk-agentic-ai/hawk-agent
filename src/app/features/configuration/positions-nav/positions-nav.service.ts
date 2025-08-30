import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';

export type PositionNavRow = {
  nav_id: string;
  entity_id: string | null;
  currency_code: string | null;
  nav_type: string | null;
  position_type: string | null;
  as_of_date: string | null;
  current_position: number | null;
  computed_total_nav: number | null;
  coi_amount: number | null;
  re_amount: number | null;
  buffer_pct: number | null;
  buffer_amount: number | null;
  manual_overlay_amount: number | null;
  manual_overlay_notes: string | null;
  optimal_car_amount: number | null;
  optimal_car_as_of: string | null;
  optimal_car_source: string | null;
  data_quality_status: string | null;
  data_quality_notes: string | null;
  source_system: string | null;
  source_batch_id: string | null;
  created_by?: string | null;
  created_at?: string | null;
  modified_by?: string | null;
  modified_at?: string | null;
};

@Injectable({ providedIn: 'root' })
export class PositionsNavService {
  private supabase = getSupabase();
  private table = 'position_nav_master';

  async list(params?: { search?: string }) {
    let q = this.supabase.from(this.table).select('*');
    if (params?.search?.trim()) {
      const s = params.search.trim();
      q = q.or(
        `nav_id.ilike.%${s}%,entity_id.ilike.%${s}%,currency_code.ilike.%${s}%,nav_type.ilike.%${s}%,position_type.ilike.%${s}%`
      );
    }
    q = q.order('as_of_date', { ascending: false }).order('modified_at', { ascending: false, nullsFirst: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as PositionNavRow[]) || [];
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.from(this.table).select('*').eq('nav_id', id).single();
    if (error) throw error;
    return data as PositionNavRow;
  }

  async updateById(id: string, payload: Partial<PositionNavRow>) {
    const { error } = await this.supabase.from(this.table).update(payload).eq('nav_id', id);
    if (error) throw error;
    return true;
  }

  async deleteById(id: string) {
    const { error } = await this.supabase.from(this.table).delete().eq('nav_id', id);
    if (error) throw error;
    return true;
  }

  async insert(row: PositionNavRow) {
    const { error } = await this.supabase.from(this.table).insert(row);
    if (error) throw error;
    return true;
  }
}
