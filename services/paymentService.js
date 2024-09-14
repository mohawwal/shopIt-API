const request = require("request");
const _ = require("lodash");
const product = require('../models/product')

const { initializePayment, verifyPayment } =
	require("../utils/payment")(request);

class PaymentService {
	startPayment(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Directly use _.pick without destructuring
                const form = _.pick(data, ['email', 'shippingFee', 'tax']);
    
                form.metadata = {
                    products: data.products.map((product) => ({
                        product: product.product,
                        quantity: product.quantity,
                    }))
                };

                // Retrieve the product prices from the database
                let totalAmount = 0;
                for (const item of data.products) {
                    const productData = await product.findById(item.product);
                    if (!productData) {
                        return reject(`Product with ID ${item.product} not found`);
                    }
                    
                    const productPrice = productData.price * 100;
                    totalAmount += productPrice * item.quantity;
                }

                // Add shipping fee and tax to total amount
                totalAmount += (data.shippingFee + data.tax) * 100;

                form.amount = totalAmount 
    
                initializePayment(form, (error, body) => {
                    if (error) {
                        return reject(error.message);
                    }
                    try {
                        const response = JSON.parse(body);
                        return resolve(response);
                    } catch (e) {
                        return reject("Invalid JSON response from Paystack");
                    }
                });
            } catch (error) {
                error.source = "Start Payment Service";
                return reject(error);
            }
        });
    }
    

	createPayment(req) {
        const ref = req.reference;
        if (!ref) {
            return Promise.reject({ code: 400, msg: "No reference passed in query" });
        }
        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(ref, (error, body) => {
                    if (error) {
                        return reject(error.message);
                    }
                    try {
                        const response = JSON.parse(body);
    
                        // Check if response.data is defined and has the expected structure
                        if (!response.data || !response.data.reference) {
                            return reject({
                                code: 500,
                                msg: "Invalid response from Paystack API"
                            });
                        }
    
                        // Extract necessary fields from the Paystack API response
                        const { reference, status, metadata, amount } = response.data;
                        const { email } = response.data.customer;
    
                        // Determine success based on the transaction status
                        const isSuccess = status === "success";

                        // Be sure the products are coming from metadata
                        const products = metadata?.products || [];

                        // Convert amount from kobo to naira by dividing by 100
                        const convertedAmount = amount / 100;

                        // Create a new payment object from the API response
                        const paymentDetails = {
                            reference,
                            amount: convertedAmount,
                            email,
                            products,
                            status,
                            success: isSuccess
                        };

                        // //console.log("Payment data -", paymentDetails);
    
                        // Return the payment details
                        return resolve(paymentDetails);
                    } catch (error) {
                        error.source = "Create Payment Service";
                        return reject(error);
                    }
                });
            } catch (error) {
                error.source = "Create Payment Service";
                return reject(error);
            }
        });
    }
    

	getPayment(reference) {
        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(reference, (error, body) => {
                    if (error) {
                        return reject(error.message);
                    }
                    try {
                        const response = JSON.parse(body);
                        return resolve(response.data);
                    } catch (e) {
                        return reject("Invalid JSON response from Paystack");
                    }
                });
            } catch (error) {
                error.source = 'Get Payment Service';
                return reject(error);
            }
        });
    }
}

module.exports = PaymentService;
