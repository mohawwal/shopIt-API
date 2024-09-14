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


// const https = require("https");
// const catchAsyncError = require("../middlewares/catchAsyncErrors");
// const _ = require("lodash"); // Ensure lodash is imported

// exports.paystack = catchAsyncError(async (req, res) => {
// 	try {
// 		// Destructure the required fields from request body
// 		const { email, amount, products } = req.body;

// 		// Use lodash's _.pick to extract email and amount
// 		const form = _.pick(req.body, ["email", "amount"]);

// 		// Add metadata with the list of products
// 		form.metadata = {
// 			products: products.map((product) => ({
// 				product: product.product,
// 				quantity: product.quantity,
// 			})),
// 		};

// 		console.log("Products sent from frontend:", form.metadata.products);

// 		// Convert amount to kobo (multiplied by 100)
// 		form.amount *= 100;

// 		// Prepare request body for Paystack
// 		const params = JSON.stringify({
// 			email: email,
// 			amount: amount,
// 			metadata: form.metadata,
// 		});

// 		// Options for the HTTPS request to Paystack
// 		const options = {
// 			hostname: "api.paystack.co",
// 			port: 443,
// 			path: "/transaction/initialize",
// 			method: "POST",
// 			headers: {
// 				Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
// 				"Content-Type": "application/json",
// 			},
// 		};

// 		// Send HTTPS request to Paystack
// 		const paystackReq = https.request(options, (paystackRes) => {
// 			let data = "";

// 			// Collecting chunks of data
// 			paystackRes.on("data", (chunk) => {
// 				data += chunk;
// 			});

// 			// Once the response ends, parse and send it to the frontend
// 			paystackRes.on("end", () => {
// 				const parsedData = JSON.parse(data);
// 				res.status(200).json(parsedData);
// 			});
// 		});

// 		// Handle errors during the HTTPS request
// 		paystackReq.on("error", (error) => {
// 			console.error("Error with Paystack request:", error);
// 			res.status(500).json({
// 				success: false,
// 				message: "Payment initialization failed",
// 				error: error.message || error,
// 			});
// 		});

// 		// Write the params and close the request
// 		paystackReq.write(params);
// 		paystackReq.end();
// 	} catch (error) {
// 		console.error("Error in paystack controller:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "An error occurred during the request",
// 			error: error.message || error,
// 		});
// 	}
// });
