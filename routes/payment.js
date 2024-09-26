const express = require('express')
const router = express.Router();

const { verifyPayment } = require('../controller/paymentController')

router.route('/verifyPayment').get(verifyPayment);


module.exports = router
