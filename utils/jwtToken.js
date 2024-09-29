//Create, save & send token in the cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};


module.exports = sendToken