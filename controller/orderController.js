const Order = require('../models/order');
const Product = require('../models/product');
const crypto = require('crypto')

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create a new order = /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    // if is not a user, generate a guestId using crypto UUID 
    let userId = req.user ? req.user._id : null
    let guestId = null;

    if(!userId) {
        guestId = crypto.randomUUID();
    }

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        user: userId,
        guestId: guestId
    });

    res.status(200).json({
        success: true,
        order
    });
});


//get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors( async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order) {
        return next( new ErrorHandler('No order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})


//get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors( async(req, res, next) => {

    try {
        const order = await Order.find({ user: req.user.id }).sort('-createdAt')
        res.status(200).json({
            success: true,
            order
        })

    } catch(error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
})


//Get all order - ADMIN => /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().sort('-createdAt')

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})



//Update / Process Order - ADMIN => /api/v1/admin/order/:id
exports.updateOrders = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Invalid order ID or order has been delivered', 400))
    }

  
    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    

    order.orderStatus = req.body.status
    order.createdAt = Date.now()

    await order.save()

    res.status(200).json({
        success: true,
        status: order.orderStatus
    })
})

//write the updateStock function
async function updateStock(id,quantity) {
    const product = await Product.findById(id)

    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false })
}


//Delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {
    const result = await Order.deleteOne({ _id: req.params.id })

    if(!result.deletedCount) {
        return next( new ErrorHandler('order not found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'order deleted'
    })

})
