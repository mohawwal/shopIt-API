const request = require("request");
const _ = require("lodash");

const { initializePayment, verifyPayment } =
	require("../utils/payment")(request);

class PaymentService {
	startPayment(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Directly use _.pick without destructuring
                const form = _.pick(data, ['email', 'amount']);
    
                form.metadata = {
                    products: data.products.map((product) => ({
                        product: product.product,
                        name: product.name,
                        quantity: product.quantity,
                        price: product.price,
                    }))
                };

                //console.log('Products sent from frontend:', form.metadata.products);
    
                form.amount *= 100;
    
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
                        const { reference, amount, status, metadata } = response.data;
                        const { email } = response.data.customer;
    
                        // Determine success based on the transaction status
                        const isSuccess = status === "success";

                        // Be sure the products are coming from metadata
                        const products = metadata?.products || [];

                        // Create a new payment object from the API response
                        const paymentDetails = {
                            reference,
                            amount,
                            email,
                            products,
                            status,
                            success: isSuccess
                        };

                        // console.log("Payment data -", paymentDetails);
    
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
