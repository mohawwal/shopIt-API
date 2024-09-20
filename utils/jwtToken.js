//Create, save & send token in the cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    const expiresIn = Number(process.env.EXPIRES_TIME) * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    const options = {
        expires: new Date(Date.now() + expiresIn),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'PRODUCTION',
        sameSite: 'strict'
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};


module.exports = sendToken