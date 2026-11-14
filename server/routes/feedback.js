const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

// In-memory fallback if MongoDB is offline
const inMemoryFeedback = [];

// POST /api/feedback — store user feedback in MongoDB
router.post('/', async (req, res) => {
  const { session_id, reply_id, vote, rating, comment, product_id, order_id, type } = req.body;

  const numericRating = rating || (vote === 'up' ? 5 : vote === 'down' ? 1 : 4);
  const commentText = comment || (vote ? `Vote: ${vote} for reply: ${reply_id || 'general'}` : 'User feedback');

  const feedbackData = {
    userId: null,
    orderId: order_id || null,
    productId: product_id || null,
    rating: numericRating,
    comment: commentText,
    type: type || (reply_id ? 'support' : 'general'),
    isPublic: true,
  };

  let savedToMongo = false;
  try {
    if (Feedback.db && Feedback.db.readyState === 1) {
      await Feedback.create(feedbackData);
      savedToMongo = true;
    }
  } catch (err) {
    console.warn('[Feedback] MongoDB unavailable, caching in memory:', err.message);
  }

  if (!savedToMongo) {
    inMemoryFeedback.push({
      ...feedbackData,
      id: inMemoryFeedback.length + 1,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({
    message: 'Thank you for your feedback!',
    saved_to_mongodb: savedToMongo,
    storage: savedToMongo ? 'mongodb' : 'in_memory_fallback',
  });
});

// GET /api/feedback — view feedback
router.get('/', async (req, res) => {
  try {
    if (Feedback.db && Feedback.db.readyState === 1) {
      const logs = await Feedback.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ count: logs.length, storage: 'mongodb', feedback: logs });
    }
  } catch (err) {
    console.warn('[Feedback] MongoDB read error, falling back to memory:', err.message);
  }

  res.json({
    count: inMemoryFeedback.length,
    storage: 'in_memory_fallback',
    feedback: inMemoryFeedback,
  });
});

module.exports = router;

