//Create, save & send token in the cookie
const sendToken = (user, statusCode, res) => {

    //create jwt token
    const token = user.getJwtToken()

    //Options for jwt
    const options = {
        expires: new Date(
            Date.now() + process.env.EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'PRODUCTION', 
        sameSite: 'strict'
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}

module.exports = sendToken