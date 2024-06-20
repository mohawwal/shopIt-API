const User = require('../models/user')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')

const crypto = require('crypto')
const cloudinary = require('cloudinary')

//Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
   const result = await cloudinary.v2.uploader(req.files.avatar, {
    folder: 'avatars',
    width: 150,
    crop: "scale"
   })

   const { name, email, password } = req.body;

   const user = await User.create({
    name, 
    email,
    password,
    avatar: {
        public_id: result.public_id,
        url: result.secure_url
    }
   })

   sendToken(user, 200, res)
    
})


//Login User => api/v1/Login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body

    //check if email and password is entered by user
    if(!email || !password) {
        return next(new ErrorHandler('Please enter Email & Password', 400))
    }

    //Finding user in database
    const user = await User.findOne({ email }).select('+password')

    if(!user) {
        return next(new ErrorHandler('Invalid Email or password', 401))
    }

    //Check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or password', 401))
    }

    sendToken(user, 200, res)

})


//Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})



//Forget Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    //create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\n
                    If you have not requested this email, then ignore it.`

    try{

        await sendEmail({
            email: user.email,
            subject: `ShopIT Password Recovery`,
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }

})


//reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors( async(req, res, next) => {

    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256')
    .update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken, 
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user) {
        return next (new ErrorHandler('Invalid or Expired Token', 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next (new ErrorHandler('Password does not match', 400))
    }

    //setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})


//update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors (async(req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    //check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if(!isMatched) {
        return next(new ErrorHandler('old password is incorrect', 400))
    }

    user.password = req.body.password;
    await user.save()

    send(user, 200, res)

})


//update user profile => /api/v1/update
exports.updateProfile = catchAsyncErrors (async(req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
        
})


//Logout user => /api/v1/Logout
exports.logoutUser = catchAsyncErrors( async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
    })

    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})



//Admin routes

//Get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors( async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//Get user details => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user) {
        return next (new ErrorHandler(`User not found with id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        user
    })
})


// update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors( async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})



//Delete user = /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOneAndDelete(req.params.id)

    if(!user) {
        return next (new ErrorHandler(`User not found with id:${req.params.id}`, 402))
    }


    res.status(200).json({
        success: true,
    })
})

