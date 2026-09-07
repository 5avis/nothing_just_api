export default async function handler(req, res) {
  // Only permit POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const groqApiKey = process.env.GROQ_API_KEY || (process.env.GEMINI_API_KEY?.startsWith('gsk_') ? process.env.GEMINI_API_KEY : null);
  const geminiApiKey = process.env.GEMINI_API_KEY?.startsWith('gsk_') ? null : process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    return res.status(500).json({
      error: 'API key is not configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your .env file.'
    });
  }

  // Parse request body if necessary
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
  }

  const { message, history = [] } = body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'The "message" field is required.' });
  }

  // Use Groq if key is available (fastest)
  if (groqApiKey) {
    const groqModel = process.env.GROQ_MODEL || 'groq/compound-mini';
    const messages = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (!item || !item.content) continue;
        const role = item.role === 'user' ? 'user' : 'assistant';
        messages.push({ role, content: String(item.content) });
      }
    }

    messages.push({ role: 'user', content: message.trim() });

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          max_tokens: 1024
        })
      });

      const data = await groqRes.json();

      if (!groqRes.ok) {
        const errorMsg = data?.error?.message || `Groq API returned status ${groqRes.status}`;
        return res.status(groqRes.status >= 400 && groqRes.status < 600 ? groqRes.status : 500).json({
          error: errorMsg
        });
      }

      const reply = data?.choices?.[0]?.message?.content || "No response received.";
      return res.status(200).json({ reply });
    } catch (err) {
      console.error('Groq API error:', err);
      return res.status(500).json({
        error: 'Failed to communicate with Groq API: ' + (err.message || 'Unknown network error')
      });
    }
  }

  // Fallback to Google Gemini
  const contents = [];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.content) continue;
      const role = item.role === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: String(item.content) }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }]
  });

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  try {
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errorMessage = data?.error?.message || `Gemini API returned status ${geminiRes.status}`;
      return res.status(geminiRes.status >= 400 && geminiRes.status < 600 ? geminiRes.status : 500).json({
        error: errorMessage
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      const blockReason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
      return res.status(200).json({
        reply: blockReason
          ? `[Response blocked by safety filters: ${blockReason}]`
          : "I couldn't generate a response. Please try rephrasing your prompt."
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error contacting Gemini API:', err);
    return res.status(500).json({
      error: 'Failed to communicate with Gemini API: ' + (err.message || 'Unknown network error')
    });
  }
}
