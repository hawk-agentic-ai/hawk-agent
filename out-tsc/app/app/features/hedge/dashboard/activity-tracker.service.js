import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getSupabase } from '../../../core/data/supabase.client';
let ActivityTrackerService = class ActivityTrackerService {
    constructor() {
        this.supabase = getSupabase();
        this._activities = new BehaviorSubject([]);
        this.activities$ = this._activities.asObservable();
        this.activityChannels = [];
    }
    init() {
        this.loadRecentActivities();
        this.setupRealtimeListeners();
    }
    async loadRecentActivities() {
        try {
            const activities = [];
            // Get recent hawk agent sessions (template executions)
            const { data: sessions } = await this.supabase
                .from('hawk_agent_sessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            if (sessions) {
                sessions.forEach((session) => {
                    const timeAgo = this.getTimeAgo(new Date(session.created_at));
                    const promptText = session?.metadata?.prompt_text || session?.metadata?.prompt || session?.prompt_text || '';
                    // Attempt to derive token usage for a useful tag
                    const tokens = session?.agent_response?.usage?.total_tokens
                        ?? session?.agent_response?.total_tokens
                        ?? session?.metadata?.usage?.total_tokens
                        ?? null;
                    const tags = [
                        'HAWK Agent',
                        session['template_category'] || 'Template',
                        session['agent_status'] || 'Processing'
                    ];
                    if (tokens != null)
                        tags.push(`tokens: ${tokens}`);
                    activities.push({
                        id: `session-${session['id']}`,
                        title: 'Template instruction executed',
                        description: `${session['template_category'] || 'Unknown'} template processed`,
                        timestamp: timeAgo,
                        icon: 'pi pi-play-circle',
                        iconColor: 'text-blue-600',
                        type: 'template_execution',
                        user: session['user_id'] || 'System User',
                        tags,
                        detailTime: new Date(session.created_at).toLocaleString(),
                        metadata: { ...session, prompt_text: promptText }
                    });
                });
            }
            // Get recent prompt template additions
            const { data: templates } = await this.supabase
                .from('prompt_templates')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (templates) {
                templates.forEach((template) => {
                    const timeAgo = this.getTimeAgo(new Date(template.created_at));
                    activities.push({
                        id: `template-${template['id']}`,
                        title: 'New template created',
                        description: `${template['name'] || 'Template'} added to ${template['category'] || 'category'}`,
                        timestamp: timeAgo,
                        icon: 'pi pi-plus-circle',
                        iconColor: 'text-green-600',
                        type: 'template_creation',
                        user: 'Admin User',
                        tags: ['Templates', template['category'] || 'General', 'Configuration'],
                        detailTime: new Date(template.created_at).toLocaleString(),
                        metadata: template
                    });
                });
            }
            // Get recent position changes
            const { data: positions } = await this.supabase
                .from('position_nav_master')
                .select('*')
                .order('as_of_date', { ascending: false })
                .limit(8);
            if (positions) {
                positions.forEach((position) => {
                    const timeAgo = this.getTimeAgo(new Date(position.as_of_date || position.created_at));
                    // Simulate different types of position events
                    const eventType = Math.random();
                    if (eventType > 0.7) {
                        activities.push({
                            id: `position-${position.id}`,
                            title: 'Hedge relationship terminated',
                            description: `${position.currency_code || 'Unknown'} hedge for ${position.entity_id || 'entity'}`,
                            timestamp: timeAgo,
                            icon: 'pi pi-times-circle',
                            iconColor: 'text-red-600',
                            type: 'hedge_termination',
                            user: 'Trading Desk',
                            tags: ['Hedge Accounting', position.currency_code || 'FX', 'Termination'],
                            detailTime: new Date(position.as_of_date || position.created_at).toLocaleString(),
                            metadata: position
                        });
                    }
                    else if (eventType > 0.4) {
                        activities.push({
                            id: `inception-${position.id}`,
                            title: 'Hedge inception initiated',
                            description: `New ${position.currency_code || 'Unknown'} hedge established`,
                            timestamp: timeAgo,
                            icon: 'pi pi-plus-circle',
                            iconColor: 'text-green-600',
                            type: 'inception',
                            user: 'Risk Manager',
                            tags: ['Hedge Accounting', position.currency_code || 'FX', 'Inception'],
                            detailTime: new Date(position.as_of_date || position.created_at).toLocaleString(),
                            metadata: position
                        });
                    }
                    else {
                        activities.push({
                            id: `update-${position.id}`,
                            title: 'Position updated',
                            description: `${position.currency_code || 'Unknown'} position revalued`,
                            timestamp: timeAgo,
                            icon: 'pi pi-refresh',
                            iconColor: 'text-blue-600',
                            type: 'position_update',
                            user: 'System Process',
                            tags: ['Position Management', position.currency_code || 'FX', 'Revaluation'],
                            detailTime: new Date(position.as_of_date || position.created_at).toLocaleString(),
                            metadata: position
                        });
                    }
                });
            }
            // Sort all activities by timestamp and take the most recent ones
            activities.sort((a, b) => {
                const aTime = this.parseTimeAgo(a.timestamp);
                const bTime = this.parseTimeAgo(b.timestamp);
                return aTime - bTime;
            });
            this._activities.next(activities.slice(0, 5));
        }
        catch (error) {
            console.error('Error loading activities:', error);
            // Fallback to static activities
            this.loadFallbackActivities();
        }
    }
    setupRealtimeListeners() {
        // Listen for new hawk agent sessions
        const sessionChannel = this.supabase
            .channel('hawk_agent_sessions_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hawk_agent_sessions' }, (payload) => {
            const session = payload.new;
            const promptText = session?.metadata?.prompt_text || session?.metadata?.prompt || session?.prompt_text || '';
            const tokens = session?.agent_response?.usage?.total_tokens
                ?? session?.agent_response?.total_tokens
                ?? session?.metadata?.usage?.total_tokens
                ?? null;
            const tags = [
                'HAWK Agent',
                session['template_category'] || 'Template',
                'Live'
            ];
            if (tokens != null)
                tags.push(`tokens: ${tokens}`);
            const newActivity = {
                id: `session-${session['id'] || Date.now()}`,
                title: 'Template instruction executed',
                description: `${session['template_category'] || 'Unknown'} template processed`,
                timestamp: 'Just now',
                icon: 'pi pi-play-circle',
                iconColor: 'text-blue-600',
                type: 'template_execution',
                user: session['user_id'] || 'System User',
                tags,
                detailTime: new Date().toLocaleString(),
                metadata: { ...session, prompt_text: promptText }
            };
            this.addActivity(newActivity);
        })
            .subscribe();
        // Listen for new templates
        const templateChannel = this.supabase
            .channel('prompt_templates_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prompt_templates' }, (payload) => {
            const template = payload.new;
            const newActivity = {
                id: `template-${template['id'] || Date.now()}`,
                title: 'New template created',
                description: `${template['name'] || 'Template'} added to ${template['category'] || 'category'}`,
                timestamp: 'Just now',
                icon: 'pi pi-plus-circle',
                iconColor: 'text-green-600',
                type: 'template_creation',
                user: 'Admin User',
                tags: ['Templates', template['category'] || 'General', 'Live'],
                detailTime: new Date().toLocaleString(),
                metadata: template
            };
            this.addActivity(newActivity);
        })
            .subscribe();
        // Listen for position changes
        const positionChannel = this.supabase
            .channel('position_nav_master_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'position_nav_master' }, (payload) => {
            const position = payload.new || payload.old;
            let activity;
            if (payload.eventType === 'DELETE') {
                activity = {
                    id: `delete-${position?.id || Date.now()}`,
                    title: 'Hedge relationship terminated',
                    description: `${position?.currency_code || 'Unknown'} hedge removed`,
                    timestamp: 'Just now',
                    icon: 'pi pi-times-circle',
                    iconColor: 'text-red-600',
                    type: 'hedge_termination',
                    user: 'Trading Desk',
                    tags: ['Hedge Accounting', position?.currency_code || 'FX', 'Live'],
                    detailTime: new Date().toLocaleString(),
                    metadata: position
                };
            }
            else if (payload.eventType === 'INSERT') {
                activity = {
                    id: `insert-${position?.id || Date.now()}`,
                    title: 'Hedge inception initiated',
                    description: `New ${position?.currency_code || 'Unknown'} hedge established`,
                    timestamp: 'Just now',
                    icon: 'pi pi-plus-circle',
                    iconColor: 'text-green-600',
                    type: 'inception',
                    user: 'Risk Manager',
                    tags: ['Hedge Accounting', position?.currency_code || 'FX', 'Live'],
                    detailTime: new Date().toLocaleString(),
                    metadata: position
                };
            }
            else {
                activity = {
                    id: `update-${position?.id || Date.now()}-${Date.now()}`,
                    title: 'Position updated',
                    description: `${position?.currency_code || 'Unknown'} position revalued`,
                    timestamp: 'Just now',
                    icon: 'pi pi-refresh',
                    iconColor: 'text-blue-600',
                    type: 'position_update',
                    user: 'System Process',
                    tags: ['Position Management', position?.currency_code || 'FX', 'Live'],
                    detailTime: new Date().toLocaleString(),
                    metadata: position
                };
            }
            this.addActivity(activity);
        })
            .subscribe();
        this.activityChannels = [sessionChannel, templateChannel, positionChannel];
    }
    addActivity(activity) {
        const currentActivities = this._activities.value;
        const newActivities = [activity, ...currentActivities.slice(0, 4)]; // Keep max 5 activities
        this._activities.next(newActivities);
    }
    getTimeAgo(date) {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        if (diffInHours < 24)
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7)
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
    parseTimeAgo(timeAgo) {
        if (timeAgo === 'Just now')
            return 0;
        const match = timeAgo.match(/(\d+)\s+(minute|hour|day)/);
        if (!match)
            return 999999; // Very old
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 'minute': return value;
            case 'hour': return value * 60;
            case 'day': return value * 60 * 24;
            default: return 999999;
        }
    }
    loadFallbackActivities() {
        const fallbackActivities = [
            {
                id: 'fallback-1',
                title: 'Template instruction executed',
                description: 'Hedge effectiveness template processed',
                timestamp: '15 minutes ago',
                icon: 'pi pi-play-circle',
                iconColor: 'text-blue-600',
                type: 'template_execution',
                user: 'System User',
                tags: ['HAWK Agent', 'Effectiveness', 'Processing'],
                detailTime: new Date(Date.now() - 15 * 60 * 1000).toLocaleString()
            },
            {
                id: 'fallback-2',
                title: 'New template created',
                description: 'Risk monitoring template added',
                timestamp: '1 hour ago',
                icon: 'pi pi-plus-circle',
                iconColor: 'text-green-600',
                type: 'template_creation',
                user: 'Admin User',
                tags: ['Templates', 'Risk', 'Configuration'],
                detailTime: new Date(Date.now() - 60 * 60 * 1000).toLocaleString()
            },
            {
                id: 'fallback-3',
                title: 'Hedge inception initiated',
                description: 'EUR/USD forward contract established',
                timestamp: '2 hours ago',
                icon: 'pi pi-plus-circle',
                iconColor: 'text-green-600',
                type: 'inception',
                user: 'Risk Manager',
                tags: ['Hedge Accounting', 'EUR', 'Inception'],
                detailTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()
            },
            {
                id: 'fallback-4',
                title: 'Risk threshold alert',
                description: 'GBP exposure exceeded limits',
                timestamp: '3 hours ago',
                icon: 'pi pi-exclamation-triangle',
                iconColor: 'text-orange-600',
                type: 'risk_alert',
                user: 'Risk System',
                tags: ['Risk Management', 'GBP', 'Alert'],
                detailTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString()
            },
            {
                id: 'fallback-5',
                title: 'Position updated',
                description: 'USD position revalued',
                timestamp: '4 hours ago',
                icon: 'pi pi-refresh',
                iconColor: 'text-blue-600',
                type: 'position_update',
                user: 'System Process',
                tags: ['Position Management', 'USD', 'Revaluation'],
                detailTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString()
            }
        ];
        this._activities.next(fallbackActivities);
    }
    destroy() {
        this.activityChannels.forEach(channel => {
            if (channel) {
                this.supabase.removeChannel(channel);
            }
        });
        this.activityChannels = [];
    }
};
ActivityTrackerService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ActivityTrackerService);
export { ActivityTrackerService };
//# sourceMappingURL=activity-tracker.service.js.map