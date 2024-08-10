// const catchAsyncError = require('../middlewares/catchAsyncErrors');
// const axios = require('axios');

// exports.processPayment = catchAsyncError(async (req, res, next) => {
//     try {
//         const { email, amount, products } = req.body;

//         if (!Array.isArray(products)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid products format. Expected an array of products.'
//             });
//         }

//         const formattedProducts = products.map((product) => ({
//             name: product.name,
//             quantity: product.quantity,
//             price: product.price,
//         }));

//         const response = await axios.post(
//             'https://api.paystack.co/transaction/initialize',
//             {
//                 email: email,
//                 amount: amount * 100,
//                 metadata: {
//                     products: formattedProducts,
//                 },
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                   
//                 },
//             }
//         );

//         const { authorization_url, reference } = response.data.data;
//         res.status(200).json({ 
//             success: true,
//             authorizationUrl: authorization_url,
//             reference
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             success: false,
//             error: `Internal Server Error: ${console.log(error)}` 
//         });
//     }
// });

// exports.verifyPayment = catchAsyncError(async (req, res, next) => {
//     try {
//         const { reference } = req.query;
        
//         const response = await axios.get(
//             `https://api.paystack.co/transaction/verify/${reference}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
//                 },
//             }
//         );

//         const { data } = response.data;
//         if (data.status === 'success') {
//             res.status(200).json({
//                 success: true,
//                 message: 'Payment verified successfully.',
//                 data: data
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Payment could not be verified.',
//                 data: data
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: `Internal Server Error: ${console.log(error)}`
//         });
//     }
// });


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