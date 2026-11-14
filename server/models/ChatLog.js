const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userMessage: { type: String, required: true },
    botResponse: { type: String, required: true },
    source: { type: String, enum: ['faq', 'error_code', 'gemini', 'fallback'], default: 'gemini' },
    ticketCreated: { type: Boolean, default: false },
    ticketId: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatLog', chatLogSchema);
