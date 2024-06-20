const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

const APIFeatures = require('../utils/apiFeatures');

//create new product - /api/v1/product/new
exports.newProduct = catchAsyncErrors (async (req, res, next) => {

    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product
    })
})


//Get all products => /api/v1/products
exports.getProduct = catchAsyncErrors (async (req, res, next) => {

    const resPerPage = 10; 
    const productsCount = await Product.countDocuments()

    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage)

    const products = await apiFeatures.query
    

    res.json({
        success: true,
        productsCount,
        products
    })

})


//Get single details product by ID => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})



//Get products in a category => /api/v1/category?category=:category
exports.getProductInCategory = catchAsyncErrors (async (req, res, next) => {

    const { category } = req.query;

    const productsCount = await Product.countDocuments({category: {$eq: category}})

    const resPerPage = 6;
    const pageNo = Math.ceil(productsCount/resPerPage)
    let catApiFeature;

    if(productsCount > resPerPage) {
        catApiFeature = new APIFeatures(Product.find({ category: {$eq: category} }), req.query)
        .filter()
        .pagination(resPerPage)
    } else {
        catApiFeature = new APIFeatures(Product.find({category: {eq: category}}), req.query)
        .filter()
    }

 
    const products = await catApiFeature.query

    if(!products) {
        return next (new ErrorHandler(`This category does not exist`))
    } 
    else if (productsCount <= 0) {
        return res.status(400).json({
            success: false,
            message: "This Product Folder is empty"
        })
    }
    

    res.status(200).json({
        success: true,
        category,
        resPerPage,
        productsCount,
        pageNo,
        products
    })

})



//update product => /api/v1/product/:id
exports.updateProduct = catchAsyncErrors (async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if(!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'product updated',
        product
    })
})

//Delete product => /api/v1/admin/product/:ID
exports.deleteProduct = catchAsyncErrors (async(req, res, next) => {

    const product = await Product.deleteOne({_id: req.params.id})

    if(!product.deletedCount) {
        return next(new ErrorHandler('Product not found', 404))
    }


    res.status(200).json({
        success: true,
        message: 'Product deleted',
    })
})


//create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async ( req, res, next ) => {
    
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);


    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if(isReviewed) {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating;
            }
        })

    }else {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length
    }


    product.ratings = product.reviews.reduce((acc, item) => 
        item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })

})



//Get Product Reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})


//Delete Product Review => /api/v1/delete
exports.deleteReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    const reviews = product.reviews.filter(review => 
        review._id.toString() !== req.query.id.toString()
    )

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => 
    item.rating + acc, 0)/reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})
