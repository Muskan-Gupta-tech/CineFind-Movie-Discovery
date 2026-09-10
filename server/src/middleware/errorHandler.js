/**
 * A small custom error class so route/service code can throw an error
 * with a specific HTTP status and error code attached to it.
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Express recognizes this as error-handling middleware because it has 4 args.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Always log the real error on the server for debugging.
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -`, err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  // Axios errors from the TMDB call - never leak TMDB's raw error or our key.
  if (err.isAxiosError) {
    const status = err.response?.status;

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        message: 'Movie service is temporarily unavailable. Please try again.',
        errorCode: 'MOVIE_API_AUTH_ERROR',
      });
    }
    if (status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }
    if (status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests right now. Please try again shortly.',
        errorCode: 'MOVIE_API_RATE_LIMIT',
      });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(503).json({
        success: false,
        message: 'Movie service took too long to respond. Please try again.',
        errorCode: 'MOVIE_API_TIMEOUT',
      });
    }

    return res.status(502).json({
      success: false,
      message: 'Movie service is temporarily unavailable. Please try again.',
      errorCode: 'MOVIE_API_UNAVAILABLE',
    });
  }

  // Anything unexpected: never leak the stack trace to the client.
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again.',
    errorCode: 'INTERNAL_ERROR',
  });
}

module.exports = { errorHandler, ApiError };
