const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
	let uploadResult = null;

	try {
		if (req.file) {
			console.log(req.file); 
			// Upload the file using Cloudinary's upload_stream method
			const streamUpload = (fileBuffer) => {
				return new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream(
						{ folder: "avatars", width: 150, crop: "scale" },
						(error, result) => {
							if (result) {
								resolve(result);
							} else {
								reject(error);
							}
						},
					);
					const readableStream = new Readable();
					readableStream.push(fileBuffer);
					readableStream.push(null); // End the stream
					readableStream.pipe(stream);
				});
			};

			uploadResult = await streamUpload(req.file.buffer);
		}
	} catch (error) {
		console.error("Error uploading avatar:", error);
		return next(new ErrorHandler("Error in uploading profile picture", 400));
	}

	const { name, email, password } = req.body;

	try {
		const user = await User.create({
			name,
			email,
			password,
			avatar: uploadResult
				? {
						public_id: uploadResult.public_id,
						url: uploadResult.secure_url,
				  }
				: null,
		});

		sendToken(user, 200, res);
	} catch (error) {
		if (error.code === 11000) {
			return next(new ErrorHandler("Email is already registered", 400));
		}
		return next(new ErrorHandler("Error in registering user", 401));
	}
});

//Login User => api/v1/Login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	//check if email and password is entered by user
	if (!email || !password) {
		return next(new ErrorHandler("Please enter Email & Password", 400));
	}

	//Finding user in database
	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorHandler("Invalid Email or password", 401));
	}

	//Check if password is correct or not
	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Invalid Email or password", 401));
	}

	sendToken(user, 200, res);
});

//Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		user,
	});
});

//Forget Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorHandler("User not found with this email", 404));
	}

	//Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// create reset password url for localhost
	//const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
	// Replace `${req.get('host')}` with your frontend URL if you know your frontend url
	const resetUrl = `${req.protocol}://zarmario.vercel.app/password/reset/${resetToken}`;
	// If you don't know your frontend url
	// const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

	const message = `Your password reset token is as follow:\n\n${resetUrl}\n\n
                    If you have not requested for this email, Kindly Ignore. else, change your password.`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Zarmario Password Recovery`,
			message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to: ${user.email}`,
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorHandler("Error in resetting password", 500));
	}
});

//reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
	try {
		// Hash URL token
		const resetPasswordToken = crypto
			.createHash("sha256")
			.update(req.params.token)
			.digest("hex");

		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire: { $gt: Date.now() },
		});

		if (!user) {
			return next(new ErrorHandler("Invalid or Expired Token", 400));
		}

		if (req.body.password !== req.body.confirmPassword) {
			return next(new ErrorHandler("Password does not match", 400));
		}

		// Setup new password
		user.password = req.body.password;

		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save();

		sendToken(user, 200, res);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

//update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	//check previous user password
	const isMatched = await user.comparePassword(req.body.oldPassword);
	if (!isMatched) {
		return next(new ErrorHandler("old password is incorrect", 400));
	}

	user.password = req.body.password;
	await user.save();

	send(user, 200, res);
});


// update user profile => /api/v1/update
exports.updateProfile = catchAsyncErrors(async (req, res) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // Ensure Multer uploads the file to server before uploading to Cloudinary
    if (req.file) {
        const user = await User.findById(req.user.id);

        // Delete the previous avatar from Cloudinary
        if (user?.avatar?.public_id) {
            try {
                const result = await cloudinary.uploader.destroy(user.avatar.public_id);
                //console.log("Previous avatar deleted:", result);
            } catch (error) {
                console.error("Error destroying previous avatar:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete existing avatar.",
                });
            }
        }

        // Upload the new avatar to Cloudinary using req.file.buffer
        try {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: "avatars",
                width: 150,
                allowedFormats: ['png', 'jpg', 'jpeg', 'avif'],
                crop: "scale",
            }, (error, uploadResult) => {
                if (error) {
                    console.error("Error uploading new avatar:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to upload new avatar.",
                    });
                }

                //console.log("New avatar uploaded:", uploadResult);

                newUserData.avatar = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                };

                // Update the user profile after successful upload
                updateUserProfile(req, res, newUserData);
            });

            // Pass the buffer data to the upload stream
            uploadStream.end(req.file.buffer);
        } catch (error) {
            console.error("Error uploading new avatar:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload new avatar.",
            });
        }
    } else {
        // If no file uploaded, just update profile
        updateUserProfile(req, res, newUserData);
    }
});

// Helper function to update user profile
async function updateUserProfile(req, res, newUserData) {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user profile.",
        });
    }
}




//Logout user => /api/v1/Logout
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
	});

	res.status(200).json({
		success: true,
		message: "Logged Out",
	});
});

//Admin routes
//Get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({
		success: true,
		users,
	});
});

//Get user details => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHandler(`User not found with id: ${req.params.id}`, 404),
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	};

	const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

//Delete user = /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOneAndDelete(req.params.id);

	if (!user) {
		return next(
			new ErrorHandler(`User not found with id:${req.params.id}`, 402),
		);
	}

	res.status(200).json({
		success: true,
	});
});
