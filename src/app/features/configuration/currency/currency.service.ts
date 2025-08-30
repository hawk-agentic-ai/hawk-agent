import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';

export type CurrencyRow = {
  currency_code: string;
  currency_name: string;
  currency_type: 'Matched' | 'Mismatched' | 'Mismatched_with_Proxy' | string;
  base_currency: string | null;
  is_deliverable: boolean | null;
  proxy_currency: string | null;
  settlement_days: number | null;
  dealing_currency: boolean | null;
  hedge_accounting_eligible: boolean | null;
  minimum_deal_size: number | null;
  maximum_deal_size: number | null;
  rounding_precision: number | null;
  market_hours_start: string | null;
  market_hours_end: string | null;
  cut_off_time: string | null;
  active_flag: boolean | null;
  effective_date: string;
  expiry_date: string | null;
  created_by: string | null;
  created_date: string | null;
  modified_by: string | null;
  modified_date: string | null;
  exposure_currency: string | null;
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private supabase = getSupabase();
  private table = 'currency_configuration';

  async list(params?: { search?: string; type?: string | null; active?: boolean | null }) {
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
    if (error) throw error;
    return (data as CurrencyRow[]) || [];
  }

  async getByCode(code: string) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('currency_code', code)
      .single();
    if (error) throw error;
    return data as CurrencyRow;
  }

  async updateByCode(code: string, payload: Partial<CurrencyRow>) {
    const { error } = await this.supabase
      .from(this.table)
      .update(payload)
      .eq('currency_code', code);
    if (error) throw error;
    return true;
  }

  async deleteByCode(code: string) {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq('currency_code', code);
    if (error) throw error;
    return true;
  }
}
