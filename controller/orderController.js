const Order = require('../models/order');
const Product = require('../models/product');

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
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
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
    const order = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        order
    })
})


//Get all order - ADMIN => /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()

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
