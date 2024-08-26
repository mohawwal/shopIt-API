const PaymentService = require('../services/paymentService');
const catchAsyncError = require('../middlewares/catchAsyncErrors');


const paymentInstance = new PaymentService()

exports.startPayment = catchAsyncError(async (req, res) => {
    try {
        const response = await paymentInstance.startPayment(req.body)
        res.status(201).json({success: "true", data: response});

    } catch(error) {
        res.status(500).json({
            success: "false",
            message: error.message
        })
    }
})

exports.createPayment = catchAsyncError(async (req, res) => {
    try {
        const response = await paymentInstance.createPayment(req.query)
        res.status(201).json({success: "true", data: response});

    } catch(error) {
        res.status(500).json({
            success: "false",
            message: error.message
        })

    }
})

exports.getPayment = catchAsyncError(async (req, res) => {
    try {
        const response = await paymentInstance.getPayment(req.body)
        res.status(201).json({success: "true", data: response});

    } catch(error) {
        res.status(500).json({
            success: "false",
            message: error.message
        })

    }
})