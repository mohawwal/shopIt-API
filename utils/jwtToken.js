//Create, save & send token in the cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    const expiresInDays = parseInt(process.env.EXPIRES_TIME, 10) || 7;
    const expiresDate = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds


    const options = {
        expires: expiresDate,
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