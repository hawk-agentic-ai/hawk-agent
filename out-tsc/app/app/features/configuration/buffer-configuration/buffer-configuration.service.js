import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from 'src/app/core/data/supabase.client';
let BufferConfigurationService = class BufferConfigurationService {
    constructor() {
        this.subject = new BehaviorSubject([]);
        this.rows$ = this.subject.asObservable();
        this.fetch();
        this.subscribeRealtime();
    }
    async fetch() {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase.from('buffer_configuration').select('*');
            if (!error && data) {
                this.subject.next(data);
            }
            else if (error) {
                console.error('Error loading buffer_configuration:', error);
            }
        }
        catch (e) {
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
        }
        catch (e) {
            console.warn('Supabase realtime unavailable for buffer_configuration', e);
        }
    }
    async add(row) {
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
        }
        catch (e) {
            console.error('Error adding buffer_configuration row:', e);
            throw e;
        }
    }
    async update(buffer_rule_id, changes) {
        const now = new Date().toISOString();
        try {
            const supabase = getSupabase();
            await supabase
                .from('buffer_configuration')
                .update({ ...changes, modified_date: now })
                .eq('buffer_rule_id', buffer_rule_id);
        }
        catch (e) {
            console.error('Error updating buffer_configuration row:', e);
            throw e;
        }
    }
    async delete(buffer_rule_id) {
        try {
            const supabase = getSupabase();
            await supabase.from('buffer_configuration').delete().eq('buffer_rule_id', buffer_rule_id);
        }
        catch (e) {
            console.error('Error deleting buffer_configuration row:', e);
            throw e;
        }
    }
};
BufferConfigurationService = __decorate([
    Injectable({ providedIn: 'root' })
], BufferConfigurationService);
export { BufferConfigurationService };
//# sourceMappingURL=buffer-configuration.service.js.map