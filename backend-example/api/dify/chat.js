// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, msgUid, instructionId, amount, currency, date } = req.body;
    
    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
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
}