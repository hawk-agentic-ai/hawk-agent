const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Secure server-side environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Use service key, not anon
const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Secure Dify API endpoint
app.post('/api/dify/chat', async (req, res) => {
  try {
    const { query, msgUid, instructionId, amount, currency, date } = req.body;
    
    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'blocking',
        conversation_id: '',
        user: msgUid || 'anonymous',
        files: []
      })
    });
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Dify API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Secure Dify streaming endpoint
app.post('/api/dify/stream', async (req, res) => {
  try {
    const { query, msgUid, instructionId, amount, currency, date } = req.body;
    
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
    });
    
    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'streaming',
        conversation_id: '',
        user: msgUid || 'anonymous',
        files: []
      })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      res.write(chunk);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Dify streaming error:', error);
    res.status(500).json({ error: 'Failed to stream response' });
  }
});

// Secure Supabase operations
app.get('/api/templates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    res.json(data);
    
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const template = req.body;
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert([template])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
    
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Add authentication middleware here
const authenticateUser = (req, res, next) => {
  // Implement JWT or session-based authentication
  // const token = req.headers.authorization;
  // Verify token and extract user info
  next();
};

app.listen(3000, () => {
  console.log('Secure backend server running on port 3000');
});