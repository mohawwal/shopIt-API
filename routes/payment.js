const express = require('express')
const router = express.Router();

const { startPayment, createPayment, getPayment } = require('../controller/paymentController')

router.route('/startPayment').post( startPayment )
router.route('/createPayment').get(createPayment);
router.route('/getPayment').get(getPayment);

module.exports = router

// const express = require('express')
// const router = express.Router();

// const { paystack } = require('../controller/paymentController')

// router.route('/paystack').post( paystack )

// module.exports = router