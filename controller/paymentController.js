const axios = require('axios');
const catchAsyncError = require("../middlewares/catchAsyncErrors");

// process paystack => api/v1/payment/process
exports.processPayment = catchAsyncError(async (req, res, next) => {
	
    try {
        const { email, amount, products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid products format. Expected an array of products.'
            });
        }

        const formattedProducts = products.map((product) => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            // image: product.image
        })) 

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: email,
                amount: amount * 100,
                metadata: {
                    products: formattedProducts,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                },
            }
        );

        const authorizationUrl = response.data.data.authorization_url;
        res.status(200).json({ 
            success: true,
            authorizationUrl
         });

    } catch(error) {
        res.status(500).json({ 
            success: false,
            error: `Internal Server Error: ${console.log(error)}` 
        });
    }

});
