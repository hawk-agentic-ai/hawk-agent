import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all templates
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return res.json(data);
      
    } else if (req.method === 'POST') {
      // Create new template
      const template = req.body;
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert([template])
        .select();
      
      if (error) throw error;
      return res.json(data[0]);
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Templates API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}