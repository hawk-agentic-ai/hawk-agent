import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from '../../../core/data/supabase.client';

export interface EntityMaster {
  inception_date: string;
  modified_date: string;
  termination_date: string;
  parent_child_nav_link: boolean;
  created_date: string;
  car_exemption_flag: string;
  legal_entity_code: string;
  business_unit: string;
  country_code: string;
  region: string;
  active_flag: string;
  regulatory_classification: string;
  risk_weight_category: string;
  created_by: string;
  modified_by: string;
  murex_issuer: string;
  murex_comment: string;
  entity_id: string;
  comments: string;
  entity_name: string;
  entity_type: string;
  parent_entity_id: string;
  currency_code: string;
}

@Injectable({ providedIn: 'root' })
export class EntityMasterService {
  private entitySubject = new BehaviorSubject<EntityMaster[]>([]);
  public entities$ = this.entitySubject.asObservable();
  private supabase = getSupabase();
  private channel: any;

  constructor() {
    this.fetchEntities();
    this.subscribeRealtime();
  }

  async fetchEntities() {
    const { data, error } = await this.supabase.from('entity_master').select('*');
    if (!error && data) {
      this.entitySubject.next(data);
    }
  }

  subscribeRealtime() {
    this.channel = this.supabase.channel('entity_master_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entity_master' }, payload => {
        this.fetchEntities();
      })
      .subscribe();
  }

  async addEntity(entity: Partial<EntityMaster>) {
    await this.supabase.from('entity_master').insert([entity]);
  }

  async updateEntity(entity_id: string, changes: Partial<EntityMaster>) {
    await this.supabase.from('entity_master').update(changes).eq('entity_id', entity_id);
  }

  async deleteEntity(entity_id: string) {
    await this.supabase.from('entity_master').delete().eq('entity_id', entity_id);
  }
}
