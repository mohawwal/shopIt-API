const express = require('express')
const router = express.Router();

const { getProduct, 
        getAdminProduct,
        newProduct, 
        getSingleProduct,
        updateProduct,
        deleteProduct,
        getProductInCategory,
        createProductReview,
        getProductReviews,
        deleteReviews
} = require('../controller/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/products').get(getProduct)

router.route('/admin/products').get(getAdminProduct)

router.route('/product/new').post(isAuthenticatedUser,  authorizeRoles('admin'), newProduct)

router.route('/product/:id').get(getSingleProduct)

router.route('/admin/product/:id').put(isAuthenticatedUser,  authorizeRoles('admin'), updateProduct)

router.route('/category').get(getProductInCategory)

router.route('/admin/product/:id').delete(isAuthenticatedUser,  authorizeRoles('admin'), deleteProduct )

router.route('/review').put(isAuthenticatedUser, createProductReview)

router.route('/review').get(isAuthenticatedUser, getProductReviews)

router.route('/review').delete(isAuthenticatedUser, deleteReviews)


module.exports = router