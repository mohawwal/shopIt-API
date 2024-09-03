const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name can not exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product Price'],
        maxLength: [9, 'Product price can not exceed 9 characters'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    // size: {
    //     type: String,
    //     required: [true, 'Please enter product size']
    // },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Select category for this product'],
        enum: {
            values: [
                'Men_Shirt',
                'Men_T-Shirt',
                'Men_Polo',
                'Men_Short',
                'Men_Trouser',
                'Men_Jean',
                'Men_Suit',
                'Men_Jacket',
                'Men_Cap',

                'Women_Dresses',
                'WomanShirt',
                'Women_Gown',
                'Women_Jacket',
                'Women_Bag',

                'Kids_Boys',
                'kids_Girls',
                'kids_Shoes',

                'Fragrance',
                'Jewelry',
                'Gifts'
            ],
            message: 'Please select correct category for this product'
        },
        
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'enter product stock'],
        maxLength: [10, 'product can not exceed 5 character'],
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('product', productSchema)