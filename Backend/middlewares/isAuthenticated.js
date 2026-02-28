const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("./catchAsync");
const ErrorHandler = require("../utils/errorhandler");

module.exports.isAuthenticated =  catchAsync(async(req,res,next) => {
    const {token} = req.cookies;
    if(!token) {
        return next(new ErrorHandler("Please Login to Access", 456));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
})