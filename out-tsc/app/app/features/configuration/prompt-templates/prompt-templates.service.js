import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from '../../../core/data/supabase.client';
let PromptTemplatesService = class PromptTemplatesService {
    constructor() {
        this.templatesSubject = new BehaviorSubject([]);
        this.templates$ = this.templatesSubject.asObservable();
        this.loadTemplates();
    }
    async loadTemplates() {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('prompt_templates')
                .select('*')
                .order('display_order', { ascending: true });
            if (error)
                throw error;
            this.templatesSubject.next(data || []);
        }
        catch (error) {
            console.error('Error loading prompt templates:', error);
            console.warn('Loading fallback templates...');
            // Provide fallback templates when database is unavailable
            this.templatesSubject.next(this.getFallbackTemplates());
        }
    }
    getFallbackTemplates() {
        return [
            {
                id: 'fallback-1',
                name: 'Hedge Analysis Template',
                family_type: 'hedge_accounting',
                template_category: 'analysis',
                description: 'Basic hedge analysis template',
                prompt_text: 'Analyze {{hedge_type}} effectiveness for {{entity}} covering {{currency}} exposure of {{amount}}.',
                input_fields: ['hedge_type', 'entity', 'currency', 'amount'],
                status: 'active',
                display_order: 1
            },
            {
                id: 'fallback-2',
                name: 'Risk Assessment Template',
                family_type: 'risk_management',
                template_category: 'assessment',
                description: 'Basic risk assessment template',
                prompt_text: 'Assess {{risk_type}} risk for {{portfolio}} with exposure {{amount}} in {{currency}}.',
                input_fields: ['risk_type', 'portfolio', 'amount', 'currency'],
                status: 'active',
                display_order: 2
            }
        ];
    }
    async addTemplate(template) {
        try {
            const supabase = getSupabase();
            // Extract input fields from prompt text
            const inputFields = this.extractInputFields(template.prompt_text || '');
            const { error } = await supabase
                .from('prompt_templates')
                .insert([{
                    ...template,
                    input_fields: inputFields,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    created_by: 'current_user', // Replace with actual user
                    updated_by: 'current_user'
                }]);
            if (error)
                throw error;
            await this.loadTemplates();
        }
        catch (error) {
            console.error('Error adding template:', error);
            throw error;
        }
    }
    async updateTemplate(id, template) {
        try {
            const supabase = getSupabase();
            // Extract input fields from prompt text
            const inputFields = this.extractInputFields(template.prompt_text || '');
            const { error } = await supabase
                .from('prompt_templates')
                .update({
                ...template,
                input_fields: inputFields,
                updated_at: new Date().toISOString(),
                updated_by: 'current_user' // Replace with actual user
            })
                .eq('id', id);
            if (error)
                throw error;
            await this.loadTemplates();
        }
        catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }
    async deleteTemplate(id) {
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('prompt_templates')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            await this.loadTemplates();
        }
        catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }
    async incrementUsageCount(id) {
        try {
            const supabase = getSupabase();
            const { error } = await supabase.rpc('increment_template_usage', {
                template_id: id
            });
            if (error)
                throw error;
            await this.loadTemplates();
        }
        catch (error) {
            console.error('Error incrementing usage count:', error);
        }
    }
    async getTemplatesByFamilyType(familyType) {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('prompt_templates')
                .select('*')
                .eq('family_type', familyType)
                .eq('status', 'active')
                .order('display_order', { ascending: true });
            if (error)
                throw error;
            return data || [];
        }
        catch (error) {
            console.error('Error getting templates by family type:', error);
            return [];
        }
    }
    async searchTemplates(query, familyType) {
        try {
            const supabase = getSupabase();
            let queryBuilder = supabase
                .from('prompt_templates')
                .select('*')
                .eq('status', 'active');
            if (familyType) {
                queryBuilder = queryBuilder.eq('family_type', familyType);
            }
            if (query) {
                queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,template_filters.ilike.%${query}%`);
            }
            const { data, error } = await queryBuilder.order('display_order', { ascending: true });
            if (error)
                throw error;
            return data || [];
        }
        catch (error) {
            console.error('Error searching templates:', error);
            return [];
        }
    }
    extractInputFields(promptText) {
        // Extract field names from {{ field | filter }} and [field] patterns
        const fields = [];
        const seen = new Set();
        let match;
        // Match {{ field }} allowing optional pipes/filters after the variable
        const braceRe = /\{\{\s*([a-zA-Z0-9_]+)(?:[^}]*)\}\}/g;
        while ((match = braceRe.exec(promptText)) !== null) {
            const raw = (match[1] || '').trim();
            const normalized = raw.replace(/[^a-zA-Z0-9_]/g, '');
            const key = normalized.toLowerCase();
            if (key && !seen.has(key)) {
                seen.add(key);
                fields.push(normalized);
            }
        }
        // Match [field] with alphanum/underscore only
        const bracketRe = /\[\s*([a-zA-Z0-9_]+)\s*\]/g;
        while ((match = bracketRe.exec(promptText)) !== null) {
            const raw = (match[1] || '').trim();
            const normalized = raw.replace(/[^a-zA-Z0-9_]/g, '');
            const key = normalized.toLowerCase();
            if (key && !seen.has(key)) {
                seen.add(key);
                fields.push(normalized);
            }
        }
        return fields;
    }
    // Helper method to get input fields for a template
    getInputFields(promptText) {
        return this.extractInputFields(promptText);
    }
    // Helper method to replace placeholders with actual values
    fillTemplate(promptText, values) {
        let filledText = promptText;
        Object.keys(values).forEach(key => {
            const v = values[key] || `{{${key}}}`;
            // Replace both {{key}} and [key] ignoring case for convenience
            const braceRe = new RegExp(`\\{\\{\s*${key}\s*\\}\\}`, 'gi');
            const bracketRe = new RegExp(`\\[\s*${key}\s*\\]`, 'gi');
            filledText = filledText.replace(braceRe, v);
            filledText = filledText.replace(bracketRe, v);
        });
        return filledText;
    }
    // Get unique family types from database
    async getUniqueFamilyTypes() {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('prompt_templates')
                .select('family_type')
                .eq('status', 'active');
            if (error)
                throw error;
            const uniqueTypes = [...new Set((data || []).map(t => t.family_type))];
            return uniqueTypes.map(type => ({
                label: this.formatFamilyLabel(type),
                value: type
            }));
        }
        catch (error) {
            console.error('Error getting unique family types:', error);
            return [];
        }
    }
    // Get unique template categories for a specific family type
    async getTemplateCategoriesByFamily(familyType) {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('prompt_templates')
                .select('template_category')
                .eq('family_type', familyType)
                .eq('status', 'active');
            if (error)
                throw error;
            const uniqueCategories = [...new Set((data || []).map(t => t.template_category))];
            return uniqueCategories.map(category => ({
                label: this.formatCategoryLabel(category),
                value: category
            }));
        }
        catch (error) {
            console.error('Error getting template categories:', error);
            return [];
        }
    }
    formatFamilyLabel(family) {
        const map = {
            hedge_accounting: 'Hedge Accounting',
            risk_management: 'Risk Management',
            compliance: 'Compliance',
            reporting: 'Reporting',
            analysis: 'Analysis',
            operations: 'Operations'
        };
        return map[family] || this.formatCategoryLabel(family);
    }
    formatCategoryLabel(category) {
        return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
};
PromptTemplatesService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], PromptTemplatesService);
export { PromptTemplatesService };
//# sourceMappingURL=prompt-templates.service.js.map