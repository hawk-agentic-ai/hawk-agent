import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from '../../../core/data/supabase.client';
let EntityMasterService = class EntityMasterService {
    constructor() {
        this.entitySubject = new BehaviorSubject([]);
        this.entities$ = this.entitySubject.asObservable();
        this.supabase = getSupabase();
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
    async addEntity(entity) {
        await this.supabase.from('entity_master').insert([entity]);
    }
    async updateEntity(entity_id, changes) {
        await this.supabase.from('entity_master').update(changes).eq('entity_id', entity_id);
    }
    async deleteEntity(entity_id) {
        await this.supabase.from('entity_master').delete().eq('entity_id', entity_id);
    }
};
EntityMasterService = __decorate([
    Injectable({ providedIn: 'root' })
], EntityMasterService);
export { EntityMasterService };
//# sourceMappingURL=entity-master.service.js.map