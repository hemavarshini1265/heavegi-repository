const express = require('express');
const axios = require('axios');
const { getDb } = require('../db/sqlite');
const ChatLog = require('../models/ChatLog');

const router = express.Router();

// Fallback in-memory chat logs when MongoDB is unreachable
const inMemoryChatLogs = [];

// Stop words to clean up user queries for FAQ search
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'whats', 'how', 'why',
  'can', 'could', 'will', 'would', 'do', 'does', 'did', 'to', 'for', 'in', 'on',
  'at', 'by', 'of', 'and', 'or', 'my', 'your', 'i', 'me', 'please', 'tell', 'show',
]);

// Intelligent local search across error codes and FAQs
function searchKnowledgeBase(db, rawMessage) {
  const cleanMsg = rawMessage.trim().toLowerCase();

  // 1. Check for specific Error Codes first (exact numbers or names)
  const errorCodePatterns = [
    '400', '401', '403', '404', '429', '500', '503',
    'heavegi-001', 'heavegi 001', 'heavegi001', 'gateway timeout', 'unauthorized',
    'forbidden', 'not found', 'bad request', 'internal server error', 'too many requests', 'service unavailable'
  ];

  for (const pattern of errorCodePatterns) {
    if (cleanMsg.includes(pattern)) {
      // Find matching error code
      let ec = null;
      if (/^\d{3}$/.test(pattern) || pattern.startsWith('heavegi')) {
        const lookup = pattern.toUpperCase().replace(/\s+/g, '-');
        ec = db.prepare('SELECT * FROM error_codes WHERE UPPER(code) = ?').get(lookup);
      }
      if (!ec) {
        ec = db.prepare(
          'SELECT * FROM error_codes WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? LIMIT 1'
        ).get(`%${pattern}%`, `%${pattern}%`);
      }

      if (ec) {
        return {
          found: true,
          source: 'error_code',
          response: `**Error ${ec.code} — ${ec.title}**\n\n📌 **Description:** ${ec.description}\n\n🛠️ **How to Resolve:** ${ec.resolution || 'Please refresh the page or contact Heavegi support.'}`,
        };
      }
    }
  }

  // 2. Exact or substring match in FAQs
  const exactFaq = db.prepare(
    'SELECT * FROM faqs WHERE LOWER(question) LIKE ? OR LOWER(?) LIKE LOWER(question) LIMIT 1'
  ).get(`%${cleanMsg}%`, cleanMsg);

  if (exactFaq) {
    return {
      found: true,
      source: 'faq',
      response: `**Q: ${exactFaq.question}**\n\n${exactFaq.answer}`,
    };
  }

  // 3. Keyword matching for FAQs (filtering out common filler words)
  const tokens = cleanMsg
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (tokens.length > 0) {
    const allFaqs = db.prepare('SELECT * FROM faqs').all();
    let bestMatch = null;
    let maxScore = 0;

    for (const faq of allFaqs) {
      const qText = faq.question.toLowerCase();
      const aText = faq.answer.toLowerCase();
      let score = 0;

      for (const token of tokens) {
        if (qText.includes(token)) score += 3;
        else if (aText.includes(token)) score += 1;
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    }

    // Require at least a threshold score
    if (bestMatch && maxScore >= 2) {
      return {
        found: true,
        source: 'faq',
        response: `**Frequently Asked Question:**\n\n**${bestMatch.question}**\n\n${bestMatch.answer}`,
      };
    }
  }

  return { found: false };
}

// POST /api/chat — Process assistant message
router.post('/', async (req, res) => {
  const { message, session_id } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const sessionId = session_id || `sess_${Date.now()}`;
  const db = getDb();
  let botResponse = '';
  let source = 'gemini';
  let ticketCreated = false;
  let ticketId = null;

  // 1. Search FAQs and Error Codes in SQLite
  const localMatch = searchKnowledgeBase(db, message);
  if (localMatch.found) {
    botResponse = localMatch.response;
    source = localMatch.source;
  } else {
    // 2. Try Gemini API if key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await axios.post(
          geminiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are the friendly AI Customer Assistant for Heavegi Platforms (India's premier e-commerce marketplace). Provide a concise, polite answer using Indian Rupee (₹) and Indian e-commerce conventions. User query: ${message}`,
                  },
                ],
              },
            ],
          },
          { timeout: 7000 }
        );
        botResponse = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (botResponse) source = 'gemini';
      } catch (err) {
        console.warn('[Gemini API] Request failed or timed out:', err.message);
      }
    }

    // 3. Fallback: Auto-create Support Ticket in SQL as required by assessment
    if (!botResponse) {
      source = 'ticket_auto_created';
      try {
        const stmt = db.prepare(
          'INSERT INTO tickets (user_id, subject, description, priority, status) VALUES (?,?,?,?,?)'
        );
        const result = stmt.run(
          null,
          `AI Inquiry: ${message.substring(0, 50)}...`,
          message,
          'medium',
          'open'
        );
        ticketCreated = true;
        ticketId = result.lastInsertRowid;

        botResponse = `Namaste! I couldn't find an exact answer in our FAQ or error documentation, so I have automatically raised a **Support Ticket (#${ticketId})** for you.\n\nOur Heavegi customer support team in India will review your query ("${message.trim()}") and assist you shortly.\n\nYou can also browse our Help & FAQ page or check our System Error Codes for instant guidance.`;
      } catch (dbErr) {
        console.error('[Ticket DB Error]', dbErr.message);
        botResponse = `Namaste! Thank you for contacting Heavegi Platforms. We could not find a direct answer to your inquiry, but our customer support desk is available 24x7 at support@heavegi.in.`;
      }
    }
  }

  // 4. Save to MongoDB ChatLog (non-blocking)
  let savedToMongo = false;
  try {
    if (ChatLog.db && ChatLog.db.readyState === 1) {
      await ChatLog.create({
        sessionId,
        userMessage: message,
        botResponse,
        source,
        ticketCreated,
        ticketId,
      });
      savedToMongo = true;
    }
  } catch (err) {
    console.warn('[ChatLog] MongoDB save failed, using memory cache:', err.message);
  }

  if (!savedToMongo) {
    inMemoryChatLogs.push({
      sessionId,
      userMessage: message,
      botResponse,
      source,
      ticketCreated,
      ticketId,
      createdAt: new Date().toISOString(),
    });
  }

  // Return clean, multi-field compatible response for frontend
  res.json({
    session_id: sessionId,
    response: botResponse,
    reply: botResponse,
    message: botResponse,
    source,
    ticket_created: ticketCreated,
    ticket_id: ticketId,
    mongo_saved: savedToMongo,
  });
});

// GET /api/chat/logs — View chat logs
router.get('/logs', async (req, res) => {
  try {
    if (ChatLog.db && ChatLog.db.readyState === 1) {
      const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ count: logs.length, storage: 'mongodb', logs });
    }
  } catch (err) {
    console.warn('[ChatLog] MongoDB read failed:', err.message);
  }

  res.json({
    count: inMemoryChatLogs.length,
    storage: 'in_memory_fallback',
    logs: inMemoryChatLogs,
  });
});

module.exports = router;
