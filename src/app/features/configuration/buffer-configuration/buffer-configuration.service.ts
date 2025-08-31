import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from 'src/app/core/data/supabase.client';

export interface BufferConfiguration {
  minimum_buffer_amount: number;
  effective_date: string; // date
  expiry_date: string; // date
  maximum_buffer_amount: number;
  buffer_percentage: number;
  created_date: string; // timestamp
  rule_priority: number;
  modified_date: string; // timestamp
  active_flag: string; // 'Y'|'N'
  business_rule_description: string;
  created_by: string;
  modified_by: string;
  buffer_allocation_method: string;
  entity_id: string;
  currency_code: string;
  hedging_framework: string;
  car_exemption_flag?: string; // 'Y'|'N'|undefined
  entity_type: string;
  buffer_rule_id: string; // identifier for CRUD
  nav_type_priority: string;
}

@Injectable({ providedIn: 'root' })
export class BufferConfigurationService {
  private subject = new BehaviorSubject<BufferConfiguration[]>([]);
  public rows$ = this.subject.asObservable();
  private channel: any;

  constructor() {
    this.fetch();
    this.subscribeRealtime();
  }

  async fetch() {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('buffer_configuration').select('*');
      if (!error && data) {
        this.subject.next(data as BufferConfiguration[]);
      } else if (error) {
        console.error('Error loading buffer_configuration:', error);
      }
    } catch (e) {
      console.warn('Supabase unavailable for buffer_configuration.fetch()', e);
      // leave current data as-is
    }
  }

  subscribeRealtime() {
    try {
      const supabase = getSupabase();
      this.channel = supabase
        .channel('buffer_configuration_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'buffer_configuration' }, () => {
          this.fetch();
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime unavailable for buffer_configuration', e);
    }
  }

  async add(row: Partial<BufferConfiguration>) {
    // server defaults for audit fields if not provided
    const now = new Date().toISOString();
    try {
      const supabase = getSupabase();
      await supabase.from('buffer_configuration').insert([
        {
          ...row,
          created_date: row.created_date || now,
          modified_date: row.modified_date || now,
        }
      ]);
    } catch (e) {
      console.error('Error adding buffer_configuration row:', e);
      throw e;
    }
  }

  async update(buffer_rule_id: string, changes: Partial<BufferConfiguration>) {
    const now = new Date().toISOString();
    try {
      const supabase = getSupabase();
      await supabase
        .from('buffer_configuration')
        .update({ ...changes, modified_date: now })
        .eq('buffer_rule_id', buffer_rule_id);
    } catch (e) {
      console.error('Error updating buffer_configuration row:', e);
      throw e;
    }
  }

  async delete(buffer_rule_id: string) {
    try {
      const supabase = getSupabase();
      await supabase.from('buffer_configuration').delete().eq('buffer_rule_id', buffer_rule_id);
    } catch (e) {
      console.error('Error deleting buffer_configuration row:', e);
      throw e;
    }
  }
}
