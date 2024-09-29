const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user')


//Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resources`, 
                403))
        }
        next()
    }
}


//check if user is authenticated using header
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer")) {
		return next(new ErrorHandler('Login first to access this resource', 401));
	}
	
	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		//console.log("Decoded Token:", decoded);
		req.user = await User.findById(decoded.id);
		//console.log("User from DB:", req.user);
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
            return next(new ErrorHandler('Token has expired, please log in again', 401));
        }
        return next(new ErrorHandler('Authentication Failed', 401));
	}
})


//Guest and non Auth to added new order
exports.orderGuestAuthUsers = catchAsyncErrors(async (req, res, next) => {
    let userId = null
    let guestId = null

	const authHeader = req.headers.authorization;

    if(authHeader && authHeader.startsWith("Bearer")) {
		const token = authHeader.split(" ")[1];

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.id
			req.user = await User.findById(userId)
		} catch(error) {
			console.error('JWT verification failed:', error);
            return next(new ErrorHandler('JWT verification failed', 401));
		}

	} else {
		guestId = `${uuidv4()}`
	}

    if(userId) {
        req.guestId = null
        req.userId = userId
    } else {
        req.userId = null;
        req.guestId = guestId
    }

    next()
})
