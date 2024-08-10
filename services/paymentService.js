const request = require("request");
const _ = require("lodash");

const { initializePayment, verifyPayment } =
	require("../utils/payment")(request);

class PaymentService {
	startPayment(data) {
		return new Promise(async (resolve, reject) => {
			try {
				//const { email, amount, products } = req.body;
				const form = _.pick(data, ["email", "amount", "full_name"]);
				form.metadata = {
					full_name: form.full_name,
				};
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
		if (ref == null) {
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

						// Extract necessary fields from the Paystack API response
						const { reference, amount, status } = response.data;
						const { email } = response.data.customer;
						const full_name = response.data.metadata.full_name;

						// Create a new payment object from the API response
						const paymentDetails = {
							reference,
							amount,
							email,
							full_name,
							status,
						};

						// Return the payment details without saving to any database
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