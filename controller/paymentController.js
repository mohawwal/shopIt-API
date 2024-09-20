const PaymentService = require('../services/paymentService');
const catchAsyncError = require('../middlewares/catchAsyncErrors');

// const Order = require("../models/order");
const Product = require("../models/product");

const paymentInstance = new PaymentService()

exports.startPayment = catchAsyncError(async (req, res) => {
    try {
        const response = await paymentInstance.startPayment(req.body)
        res.status(201).json({
            success: "true",
            data: response
        });
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
        // //console.log("cpr -", response)

        const products = response.products

        for(const item of products) {
            //console.log("item product & quantity - ", item.quantity, item.product);
            await updateStock(item.product, item.quantity)
        }

        res.status(201).json({
            success: "true",
            data: response
        });

    } catch(error) {
        //console.log(error)
        res.status(500).json({
            success: "false",
            message: error.message
        })

    }
})

// write the updateStock function
async function updateStock(id, quantity) {
	const product = await Product.findById(id);

	if(!product) {
		throw new ErrorHandler(`Product with ID ${id} not found`, 404);
	}

	product.stock = product.stock - quantity;

	await product.save({ validateBeforeSave: false });
}

exports.getPayment = catchAsyncError(async (req, res) => {
    try {
        const response = await paymentInstance.getPayment(req.body)

        res.status(201).json({
            success: "true",
            data: response
        });
    } catch(error) {
        res.status(500).json({
            success: "false",
            message: error.message
        })

    }
})
