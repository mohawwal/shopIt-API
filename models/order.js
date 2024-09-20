const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    shippingInfo: {
        name: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        park: {
            type: String,
            required: false
        },
        phoneNo: {
            type: String,
            required: true
        },
        orderNote: {
            type: String,
            required: false
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return !this.guestId },
    },
    guestId: {
        type: String,
        required: function() { return !this.user },
        set: function (v) { return `guest_${v}`; }
    },

    orderItems: [
        {
            quantity: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    paymentInfo: {
        id: {
            type: String
        },
        reference: {
            type: String,
        },
        success: {
            type: Boolean,
        },
        status: {
            type: String
        }
    },
    paidAt: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    deliveredAt : {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })



module.exports = mongoose.model('Order', orderSchema)