const express = require('express')
const router = express.Router();

const { processPayment } = require('../controller/paymentController')

router.route('/payment/process').post(processPayment)

module.exports = router