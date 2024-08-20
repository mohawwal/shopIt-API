const Product = require("../models/product");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const APIFeatures = require("../utils/apiFeatures");

const cloudinary = require("cloudinary");

//create new product - /api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
	let images = [];

	if (typeof req.body.images === "string") {
		images.push(req.body.images);
	} else {
		images = req.body.images;
	}

	let imagesLink = [];

	try {
		for (let i = 0; i < images.length; i++) {
			if (
				typeof images[i] === "string" &&
				images[i].startsWith("data:image/")
			) {
				const result = await cloudinary.uploader.upload(images[i], {
					folder: "products",
				});

				imagesLink.push({
					public_id: result.public_id,
					url: result.secure_url,
				});
			} else if (typeof images[i] === "object" && images[i].url) {
				imagesLink.push(images[i]);
			} else {
				return next(new ErrorHandler("Invalid image data type", 400));
			}
		}

		req.body.images = imagesLink;
		req.body.user = req.user.id;

		const product = await Product.create(req.body);

		res.status(200).json({
			success: true,
			product,
		});
	} catch (error) {
		console.error("Error uploading product images:", error);
		return next(new ErrorHandler("Error in uploading product images", 400));
	}
});

//Get all products => /api/v1/products
exports.getProduct = catchAsyncErrors(async (req, res, next) => {
	const resPerPage = 10;
	const productsCount = await Product.countDocuments();

	const apiFeatures = new APIFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resPerPage)
		.sort("-createdAt");

	const products = await apiFeatures.query;

	res.status(200).json({
		success: true,
		productsCount,
		products,
	});
});

//Get all products (Admin) => /api/v1/products
exports.getAdminProduct = catchAsyncErrors(async (req, res, next) => {
	const products = await Product.find();

	res.status(200).json({
		success: true,
		products,
	});
});

//Get single details product by ID => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	res.status(200).json({
		success: true,
		product,
	});
});

//Get products in a category => /api/v1/category?category=:category
exports.getProductInCategory = catchAsyncErrors(async (req, res, next) => {
	const { category } = req.query;

	const productsCount = await Product.countDocuments({
		category: { $eq: category },
	});

	const resPerPage = 6;
	const pageNo = Math.ceil(productsCount / resPerPage);

	let catApiFeature;

	if (productsCount > resPerPage) {
		catApiFeature = new APIFeatures(
			Product.find({ category: { $eq: category } }),
			req.query,
		)
			.filter()
			.pagination(resPerPage);
	} else {
		catApiFeature = new APIFeatures(
			Product.find({ category: { eq: category } }),
			req.query,
		).filter();
	}

	const products = await catApiFeature.query;

	if (!products) {
		return next(new ErrorHandler(`category does not exist`));
	} else if (productsCount <= 0) {
		return res.status(400).json({
			success: false,
			message: "Product category is empty",
		});
	}

	res.status(200).json({
		success: true,
		category,
		resPerPage,
		productsCount,
		pageNo,
		products,
	});
});

//update product => /api/v1/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
	let product = await Product.findById(req.params.id);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

    let images = []

    if(typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if(images !== undefined) {
        for(let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imageLink = []
        for(let i=0; i > images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: `products`
            });

            imageLink.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }
        req.body.images = imageLink
    }

	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		message: "product updated",
		product,
	});
});

//Delete product => /api/v1/admin/product/:ID
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}

	//Delete images associated with the product
	for (let i = 0; i < product.images.length; i++) {
		await cloudinary.v2.uploader.destroy(product.images[i].public_id);
	}

	await product.deleteOne();

	res.status(200).json({
		success: true,
		message: "Product deleted",
	});
});

//create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
	const { rating, comment, productId } = req.body;

	const review = {
		user: req.user._id,
		name: req.user.name,
		rating: Number(rating),
		comment,
	};

	const product = await Product.findById(productId);

	const isReviewed = product.reviews.find(
		(r) => r.user.toString() === req.user._id.toString(),
	);

	if (isReviewed) {
		product.reviews.forEach((review) => {
			if (review.user.toString() === req.user._id.toString()) {
				review.comment = comment;
				review.rating = rating;
			}
		});
	} else {
		product.reviews.push(review);
		product.numberOfReviews = product.reviews.length;
	}

	product.ratings =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		product.reviews.length;

	await product.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
	});
});

//Get Product Reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	res.status(200).json({
		success: true,
		reviews: product.reviews,
	});
});

//Delete Product Review => /api/v1/delete
exports.deleteReviews = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);

	const reviews = product.reviews.filter(
		(review) => review._id.toString() !== req.query.id.toString(),
	);

	const numOfReviews = reviews.length;

	const ratings =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		reviews.length;

	await Product.findByIdAndUpdate(
		req.query.productId,
		{
			reviews,
			ratings,
			numOfReviews,
		},
		{
			new: true,
			runValidators: true,
			useFindAndModify: false,
		},
	);

	res.status(200).json({
		success: true,
	});
});
