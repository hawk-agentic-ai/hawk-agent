import { Injectable } from '@angular/core';
import { getSupabase } from 'src/app/core/data/supabase.client';

export interface HedgeInstruction {
  value_date: string | null;
  processed_timestamp: string | null;
  response_timestamp: string | null;
  received_timestamp: string | null;
  buffer_pct_snapshot: number | null;
  response_notional: number | null;
  allocated_notional: number | null;
  created_date: string | null;
  not_allocated_notional: number | null;
  modified_date: string | null;
  instruction_date: string | null;
  hedge_amount_order: number | null;
  hedging_state_snapshot: string | null;
  car_exemption_snapshot: string | null; // 'Y'|'N'
  instruction_status: string | null;
  check_status: string | null;
  acknowledgement_status: string | null;
  usd_pb_check_status: string | null;
  failure_reason: string | null;
  request_id: string | null;
  external_trade_id: string | null;
  portfolio_code: string | null;
  created_by: string | null;
  modified_by: string | null;
  instruction_fingerprint: string | null;
  instruction_id: string | null;
  result: string | null;
  msg_uid: string | null;
  instruction_type: string | null; // char
  exposure_currency: string | null;
  order_id: string | null;
  sub_order_id: string | null;
  previous_order_id: string | null;
  supersedes_msg_uid: string | null;
  hedge_method: string | null;
  hedging_instrument_hint: string | null;
  tenor_or_maturity: string | null;
  framework_id_snapshot: string | null;
}

@Injectable({ providedIn: 'root' })
export class HedgeInstructionsService {
  private table = 'hedge_instructions';
  private channel: any;

  async list(params?: { search?: string; status?: string | null; fromDate?: string | null; toDate?: string | null; portfolio?: string | null }) {
    try {
      const supabase = getSupabase();
      let q = supabase.from(this.table).select('*').order('created_date', { ascending: false }).limit(1000);
      if (params?.search?.trim()) {
        const s = params.search.trim();
        q = q.or(`instruction_id.ilike.%${s}%,msg_uid.ilike.%${s}%,instruction_status.ilike.%${s}%,portfolio_code.ilike.%${s}%`);
      }
      if (params?.status) q = q.eq('instruction_status', params.status);
      if (params?.portfolio) q = q.eq('portfolio_code', params.portfolio);
      if (params?.fromDate) q = q.gte('instruction_date', params.fromDate);
      if (params?.toDate) q = q.lte('instruction_date', params.toDate);
      const { data, error } = await q;
      if (error) throw error;
      return (data as HedgeInstruction[]) || [];
    } catch (e) {
      console.error('Failed to load hedge_instructions', e);
      return [];
    }
  }

  subscribeRealtime(onChange: () => void) {
    try {
      const supabase = getSupabase();
      this.channel = supabase
        .channel('hedge_instructions_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, () => onChange())
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription unavailable for hedge_instructions', e);
    }
  }

  async add(payload: Partial<HedgeInstruction>) {
    const supabase = getSupabase();
    const { error } = await supabase.from(this.table).insert([payload]);
    if (error) throw error;
  }

  async updateById(instruction_id: string, changes: Partial<HedgeInstruction>) {
    const supabase = getSupabase();
    const { error } = await supabase.from(this.table).update(changes).eq('instruction_id', instruction_id);
    if (error) throw error;
  }

  async deleteById(instruction_id: string) {
    const supabase = getSupabase();
    const { error } = await supabase.from(this.table).delete().eq('instruction_id', instruction_id);
    if (error) throw error;
  }
}
