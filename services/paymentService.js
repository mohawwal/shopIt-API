const request = require("request");
const _ = require("lodash");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const { initializePayment, verifyPayment } = require("../utils/payment")(request);

class PaymentService {
    async startPayment(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const form = _.pick(data, ["email", "amount"]);

                // Validate email and amount
                if (!form.email) {
                    return reject(new ErrorHandler("Email is required", 400));
                }

                const parsedAmount = Number(form.amount) * 100;
                if (isNaN(parsedAmount)) {
                    return reject(new ErrorHandler("Amount must be a valid number", 400));
                }

                if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
                    return reject(new ErrorHandler("Products are required", 400));
                }

                // Add metadata for products
                form.metadata = {
                    products: data.products.map((product) => ({
                        product: product.product,
                        quantity: product.quantity,
                    })),
                };

                // Check if all products exist
                for (const item of data.products) {
                    const productData = await Product.findById(item.product);
                    if (!productData) {
                        return reject(new ErrorHandler(`Product with ID ${item.product} not found`, 404));
                    }
                }

                // Initialize payment with Paystack
                initializePayment(form, (error, body) => {
                    if (error) {
                        return reject(new ErrorHandler(`Paystack error: ${error.message}`, 500));
                    }
                    try {
                        const response = JSON.parse(body);
                        if (!response.status || response.status !== true) {
                            return reject(new ErrorHandler(`Paystack failed: ${response.message}`, 500));
                        }
                        return resolve(response);
                    } catch (e) {
                        return reject(new ErrorHandler("Invalid JSON response from Paystack", 500));
                    }
                });
            } catch (error) {
                error.source = "Start Payment Service";
                return reject(new ErrorHandler(error.message, 500));
            }
        });
    }

    async createPayment(req) {
        const ref = req.reference;
        if (!ref) {
            return Promise.reject(new ErrorHandler("No reference passed in query", 400));
        }

        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(ref, (error, body) => {
                    if (error) {
                        return reject(new ErrorHandler(`Paystack error: ${error.message}`, 500));
                    }

                    try {
                        const response = JSON.parse(body);

                        // Validate response
                        if (!response.data || !response.data.reference) {
                            return reject(new ErrorHandler("Invalid response from Paystack API", 500));
                        }

                        const { reference, status, metadata, amount } = response.data;
                        const { email } = response.data.customer;

                        const isSuccess = status === "success";
                        const products = metadata?.products || [];

                        const paymentDetails = {
                            reference,
                            amount: amount / 100, // Convert to Naira
                            email,
                            products,
                            status,
                            success: isSuccess,
                        };

                        return resolve(paymentDetails);
                    } catch (error) {
                        return reject(new ErrorHandler("Invalid JSON response from Paystack", 500));
                    }
                });
            } catch (error) {
                error.source = "Create Payment Service";
                return reject(new ErrorHandler(error.message, 500));
            }
        });
    }

    async getPayment(reference) {
        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(reference, (error, body) => {
                    if (error) {
                        return reject(new ErrorHandler(`Paystack error: ${error.message}`, 500));
                    }
                    try {
                        const response = JSON.parse(body);
                        return resolve(response.data);
                    } catch (e) {
                        return reject(new ErrorHandler("Invalid JSON response from Paystack", 500));
                    }
                });
            } catch (error) {
                error.source = 'Get Payment Service';
                return reject(new ErrorHandler(error.message, 500));
            }
        });
    }
}

module.exports = PaymentService;