import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { getSupabase } from '../../../core/data/supabase.client';

export interface HawkAgentSession {
  id?: number;
  msg_uid: string;
  instruction_id: string;
  
  // Session Info
  user_id: string;
  session_type: 'template' | 'agent';
  
  // Timestamps
  agent_start_time?: Date | string;
  agent_end_time?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // Status
  agent_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Token Usage
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  
  // Performance
  execution_time_ms?: number;
  memory_usage_mb?: number;
  
  // Template Info
  template_category?: string;
  template_index?: number;
  
  // Data Storage (JSONB)
  metadata?: any;
  agent_response?: any;
  error_details?: any;
}

export interface HawkAgentError {
  id?: number;
  session_id: number;
  error_type: string;
  error_message: string;
  retry_count?: number;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HawkAgentService {
  private sessionsSubject = new BehaviorSubject<HawkAgentSession[]>([]);
  public sessions$ = this.sessionsSubject.asObservable();

  constructor() {
    this.setupRealtimeSubscription();
  }

  // Create a new session (for starting a prompt)
  async createSession(sessionData: Omit<HawkAgentSession, 'id' | 'created_at' | 'updated_at'>): Promise<HawkAgentSession> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .insert([{
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Update session (for completing/failing a prompt)
  async updateSession(sessionId: number, updates: Partial<HawkAgentSession>): Promise<HawkAgentSession> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If we're marking as completed, set agent_end_time
      if (updates.agent_status === 'completed' && !updates.agent_end_time) {
        updateData.agent_end_time = new Date().toISOString();
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // Update session by msg_uid (more convenient for streaming updates)
  async updateSessionByMsgUid(msgUid: string, updates: Partial<HawkAgentSession>): Promise<HawkAgentSession> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If we're marking as completed, set agent_end_time
      if (updates.agent_status === 'completed' && !updates.agent_end_time) {
        updateData.agent_end_time = new Date().toISOString();
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .update(updateData)
        .eq('msg_uid', msgUid)
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error updating session by msg_uid:', error);
      throw error;
    }
  }

  // Get sessions with filtering and pagination
  async getSessions(filters: {
    searchTerm?: string;
    status?: string;
    dateRange?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ sessions: HawkAgentSession[]; totalCount: number }> {
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('hawk_agent_sessions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        query = query.or(`metadata->>prompt_text.ilike.${searchTerm},msg_uid.ilike.${searchTerm},instruction_id.ilike.${searchTerm}`);
      }

      if (filters.status) {
        query = query.eq('agent_status', filters.status);
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case '7days':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            cutoffDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            cutoffDate.setDate(now.getDate() - 90);
            break;
        }
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const sessions = data?.map(this.mapDatabaseToInterface) || [];
      
      return {
        sessions,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // Get single session by ID
  async getSessionById(id: number): Promise<HawkAgentSession | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw error;
    }
  }

  // Get single session by msg_uid
  async getSessionByMsgUid(msgUid: string): Promise<HawkAgentSession | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .select('*')
        .eq('msg_uid', msgUid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error fetching session by msg_uid:', error);
      throw error;
    }
  }

  // Log error for a session
  async logSessionError(sessionId: number, errorType: string, errorMessage: string, retryCount: number = 0): Promise<void> {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('hawk_agent_errors')
        .insert([{
          session_id: sessionId,
          error_type: errorType,
          error_message: errorMessage,
          retry_count: retryCount,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging session error:', error);
      throw error;
    }
  }

  // Get statistics for dashboard/analytics
  async getSessionStatistics(dateRange?: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    failedSessions: number;
    pendingSessions: number;
    averageTokens: number;
    averageProcessingTime: number;
  }> {
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('hawk_agent_sessions')
        .select('agent_status, total_tokens, execution_time_ms');

      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (dateRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case '7days':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            cutoffDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            cutoffDate.setDate(now.getDate() - 90);
            break;
        }
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        totalSessions: data?.length || 0,
        completedSessions: data?.filter((s: any) => s.agent_status === 'completed').length || 0,
        failedSessions: data?.filter((s: any) => s.agent_status === 'failed').length || 0,
        pendingSessions: data?.filter((s: any) => s.agent_status === 'pending').length || 0,
        averageTokens: 0,
        averageProcessingTime: 0
      };

      if (data && data.length > 0) {
        const totalTokens = data.reduce((sum: number, s: any) => sum + (s.total_tokens || 0), 0);
        const totalProcessingTime = data
          .filter((s: any) => s.execution_time_ms)
          .reduce((sum: number, s: any) => sum + (s.execution_time_ms || 0), 0);
        
        stats.averageTokens = Math.round(totalTokens / data.length);
        const completedSessions = data.filter((s: any) => s.execution_time_ms);
        stats.averageProcessingTime = completedSessions.length > 0 
          ? Math.round(totalProcessingTime / completedSessions.length)
          : 0;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching session statistics:', error);
      throw error;
    }
  }

  // Setup real-time subscription
  private setupRealtimeSubscription() {
    const supabase = getSupabase();
    supabase
      .channel('hawk_agent_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hawk_agent_sessions' },
        (payload: any) => {
          console.log('Real-time update:', payload);
          this.refreshSessions();
        }
      )
      .subscribe();
  }

  // Refresh sessions and emit to subscribers
  private async refreshSessions() {
    try {
      const { sessions } = await this.getSessions({ limit: 100 });
      this.sessionsSubject.next(sessions);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  }

  // Map database row to interface (handle date conversion, etc.)
  private mapDatabaseToInterface(data: any): HawkAgentSession {
    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }

  // Helper method to create session from template submission
  createSessionFromTemplate(
    msgUid: string,
    instructionId: string,
    promptText: string,
    templateCategory: string,
    templateIndex: number,
    amount?: number,
    currency?: string,
    transactionDate?: string,
    entityScope?: string
  ): Omit<HawkAgentSession, 'id' | 'created_at' | 'updated_at'> {
    return {
      msg_uid: msgUid,
      instruction_id: instructionId,
      user_id: 'test-user-v2',
      session_type: 'template',
      agent_status: 'pending',
      template_category: templateCategory,
      template_index: templateIndex,
      agent_start_time: new Date().toISOString(),
      metadata: {
        prompt_text: promptText,
        amount,
        currency,
        transaction_date: transactionDate,
        entity_scope: entityScope
      }
    };
  }
}