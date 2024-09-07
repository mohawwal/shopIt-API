const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Enter Your Name'],
        maxLength: [30, "Name can not exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, 'Enter Your EMail'],
        unique: true,
        validate: [validator.isEmail, 'Enter Valid Email Address']
    },
    password: {
        type: String,
        required: [true, 'Enter Your Password'],
        minlength: [6, 'Your Password Must Be Longer Than 6 Characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    },
    role: {
        type: String,
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },    
    resetPasswordToken: String,
    resetPasswordExpire: Date
})


//Encrypting password for save user
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)

})

//Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


//Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

//Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    //General token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken

}


module.exports = mongoose.model('User', userSchema)