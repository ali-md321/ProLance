
exports.errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    const errorResponse = {
        success: false,
        message: message,
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    console.log(errorResponse);
    res.status(statusCode).json(errorResponse);
}
