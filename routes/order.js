const express = require('express')
const router = express.Router()

const { 
    newOrder, 
    getSingleOrder, 
    myOrders, 
    allOrders,
    updateOrders,
    deleteOrder

} = require('../controller/orderController')

const { isAuthenticatedUser, authorizeRoles, orderGuestAuthUsers  } = require('../middlewares/auth')

router.route('/order/new').post( orderGuestAuthUsers, newOrder )

router.route('/order/:id').get( isAuthenticatedUser, getSingleOrder )

router.route('/orders/me').get( isAuthenticatedUser, myOrders )

router.route('/admin/orders').get( isAuthenticatedUser, authorizeRoles('admin'), allOrders )

router.route('/admin/order/:id').put( isAuthenticatedUser, authorizeRoles('admin'), updateOrders  )

router.route('/admin/order/:id').delete( isAuthenticatedUser, authorizeRoles('admin'), deleteOrder  )

module.exports = router;