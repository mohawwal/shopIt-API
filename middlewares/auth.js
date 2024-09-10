const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user')


// //checks if user is authenticated or not using cookies
// exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
//     const { token } = req.cookies

//     if(!token) {
//         return next(new ErrorHandler('Login first to access this resource', 401))
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id);
//         next();
//     } catch (error) {
//         return next(new ErrorHandler('Invalid Token', 401));
//     }

// })



// //Guest and non Auth to added new order with cookies
// exports.orderGuestAuthUsers = catchAsyncErrors(async (req, res, next) => {
//     let userId = null
//     let guestId = null

//     if(req.cookies.token) {
//         try {
//             const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
//             userId = decoded.id;
//             req.user = await User.findById(userId);
//         } catch(error) {
//             console.error('JWT verification failed:', error);
//             return next(new ErrorHandler('JWT verification failed:', 401));
//         }

//     }else {
//         guestId = uuidv4();
//     }

//     if(userId) {
//         req.guestId = null
//         req.userId = userId
//     } else {
//         req.userId = null;
//         req.guestId = guestId
//     }

//     next()

// })


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


//If you don't want to use cookies

//check if user is authenticated using header
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer")) {
		return next(new ErrorHandler('Login first to access this resource', 401));
	}
	
	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		//console.log(decoded)
		req.user = await User.findById(decoded.id);
		next();
	} catch (error) {
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
			console.log("userId decoded -", userId)
			req.user = await User.findById(userId)
		} catch(error) {
			console.error('JWT verification failed:', error);
            return next(new ErrorHandler('JWT verification failed', 401));
		}

	} else {
		guestId = `guest_${uuidv4()}`
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
