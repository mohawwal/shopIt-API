const { verifyPaymentWithPaystack } = require("../services/paymentService");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Order = require("../models/order");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");

exports.verifyPayment = catchAsyncError(async (req, res) => {
	try {
		const { reference } = req.query;

		if (!reference) {
			return res
				.status(400)
				.json({ success: false, message: "Reference is required" });
		}

		const verificationResponse = await verifyPaymentWithPaystack(reference);

		if (verificationResponse.status === false) {
			return res.status(400).json({
				success: false,
				message:
					verificationResponse.message || "Transaction verification failed",
			});
		}

		// Find the order by the reference stored in paymentInfo
		const order = await Order.findOne({ "paymentInfo.reference": reference });

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found for this transaction reference",
			});
		}

		// If payment is successful, update the payment status in the order
		order.paymentInfo.success = true;
		order.paymentInfo.status = "Payment Successful";
		order.paidAt = Date.now();

		// Loop through the order items and update the stock
		for (const item of order.orderItems) {
			await updateStock(item.product, item.quantity);
		}

		// Save update
		await order.save();

		res.status(200).json({
			success: true,
			verify: "successful",
			data: verificationResponse,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
});

async function updateStock(productId, quantity) {
	const product = await Product.findById(productId);

	if (!product) {
		throw new ErrorHandler(`Product with ID ${productId} not found`, 404);
	}

	// Decrease stock by the purchased quantity
	product.stock = product.stock - quantity;

	// Save the updated product stock
	await product.save({ validateBeforeSave: false });
}
