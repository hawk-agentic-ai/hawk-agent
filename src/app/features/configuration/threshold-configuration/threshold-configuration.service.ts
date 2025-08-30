import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from 'src/app/core/data/supabase.client';

export interface ThresholdConfiguration {
  breach_tolerance_minutes: number;
  warning_level: number;
  effective_date: string;
  expiry_date: string;
  critical_level: number;
  created_date: string;
  maximum_limit: number;
  modified_date: string;
  automated_action_flag: string;
  notification_emails: string;
  active_flag: string;
  created_by: string;
  modified_by: string;
  escalation_level_3: string;
  threshold_type: string;
  currency_code: string;
  entity_type: string;
  unit_of_measure: string;
  escalation_level_1: string;
  escalation_level_2: string;
  threshold_id: string;
}

@Injectable({ providedIn: 'root' })
export class ThresholdConfigurationService {
  private thresholdSubject = new BehaviorSubject<ThresholdConfiguration[]>([]);
  public thresholds$ = this.thresholdSubject.asObservable();
  private supabase = getSupabase();
  private channel: any;

  constructor() {
    this.fetchThresholds();
    this.subscribeRealtime();
  }

  async fetchThresholds() {
    const { data, error } = await this.supabase.from('threshold_configuration').select('*');
    if (!error && data) {
      this.thresholdSubject.next(data);
    }
  }

  subscribeRealtime() {
    this.channel = this.supabase.channel('threshold_configuration_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threshold_configuration' }, (payload: any) => {
        this.fetchThresholds();
      })
      .subscribe();
  }

  async addThreshold(threshold: Partial<ThresholdConfiguration>) {
    await this.supabase.from('threshold_configuration').insert([threshold]);
  }

  async updateThreshold(threshold_id: string, changes: Partial<ThresholdConfiguration>) {
    await this.supabase.from('threshold_configuration').update(changes).eq('threshold_id', threshold_id);
  }

  async deleteThreshold(threshold_id: string) {
    await this.supabase.from('threshold_configuration').delete().eq('threshold_id', threshold_id);
  }
}
