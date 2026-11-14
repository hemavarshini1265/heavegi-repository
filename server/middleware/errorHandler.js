const path = require('path');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR 500] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(status);

  // Return Custom 500 HTML page for browser requests
  if (req.accepts('html') && !req.originalUrl.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../../client/500.html'));
  }

  // Return JSON for API requests
  res.json({
    error: {
      status,
      code: String(status),
      message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      resolution: 'Retry the request or open the Heavegi Assistant to raise an instant support ticket.',
    },
  });
}

module.exports = errorHandler;
