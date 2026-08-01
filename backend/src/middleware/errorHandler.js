// Wraps async route handlers so thrown errors reach the error middleware
function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Express error-handling middleware (must have 4 args)
function errorHandler(err, req, res, next) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal server error',
    });
}

module.exports = { asyncHandler, errorHandler };