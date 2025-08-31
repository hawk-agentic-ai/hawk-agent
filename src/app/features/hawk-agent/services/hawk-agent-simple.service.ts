import { Injectable } from '@angular/core';
import { getSupabase } from '../../../core/data/supabase.client';

export interface SimpleHawkSession {
  id?: number;
  msg_uid: string;
  instruction_id: string;
  user_id: string;
  session_type: 'template' | 'agent';
  agent_status: 'pending' | 'completed' | 'failed';
  template_category?: string;
  template_index?: number;
  metadata?: any;
  agent_response?: any;
  created_at?: Date | string;
  updated_at?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class HawkAgentSimpleService {

  // Create a new session
  async createSession(promptText: string, msgUid: string, instructionId: string, templateCategory?: string, templateIndex?: number): Promise<SimpleHawkSession> {
    const payload: any = {
      msg_uid: msgUid,
      instruction_id: instructionId,
      user_id: 'test-user',
      session_type: 'template',
      agent_status: 'pending',
      agent_start_time: new Date().toISOString(),
      template_category: templateCategory || 'template',
      template_index: templateIndex || 1,
      metadata: { prompt_text: promptText }
    };
    try {
      const supabase = getSupabase();
      // Avoid chaining select() to prevent PostgREST 400 on some configurations
      const { error } = await supabase.from('hawk_agent_sessions').insert([payload]);
      if (error) throw error;
    } catch (error) {
      console.warn('createSession: proceeding without DB insert due to error:', error);
      // proceed without throwing to avoid blocking UI; caller logs status in Prompt History via streaming
    }
    return {
      msg_uid: msgUid,
      instruction_id: instructionId,
      user_id: 'test-user',
      session_type: 'template',
      agent_status: 'pending',
      template_category: templateCategory || 'template',
      template_index: templateIndex || 1,
      metadata: { prompt_text: promptText },
      created_at: new Date().toISOString()
    } as SimpleHawkSession;
  }

  // Get all sessions
  async getSessions(): Promise<SimpleHawkSession[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('hawk_agent_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // Update session
  async updateSession(msgUid: string, updates: any): Promise<void> {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('hawk_agent_sessions').update(updates).eq('msg_uid', msgUid);
      if (error) throw error;
    } catch (error) {
      console.warn('updateSession: non-fatal error:', error);
    }
  }
}
