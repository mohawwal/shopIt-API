const express = require('express')
const router = express.Router()
const upload = require("../middlewares/upload")

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile,
} = require('../controller/authController')


router.route('/register').post(upload.single('avatar'), registerUser)

router.route('/login').post(loginUser)

router.route('/logout').get(logoutUser)

router.route('/password/forgot').post(forgotPassword)

router.route('/password/reset/:token').put(resetPassword)

router.route('/me').get(isAuthenticatedUser, getUserProfile)

router.route('/password/update').put(isAuthenticatedUser, updatePassword)

router.route('/me/update').put(upload.single('avatar'), isAuthenticatedUser, updateProfile)


//USER ROUTER

const {
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser
} = require('../controller/authController')

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers)

router.route('/admin/user/:id').get(getUserDetails, isAuthenticatedUser, authorizeRoles('admin') )
router.route('/admin/user/:id').put(updateUser, isAuthenticatedUser, authorizeRoles('admin') )
router.route('/admin/user/:id').delete(deleteUser, isAuthenticatedUser, authorizeRoles('admin') )




module.exports = router;