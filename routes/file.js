// routes/file.js
const express = require('express');
const router = express.Router();

const { fileUpload } = require('../controller/fileController');
const upload = require('../middlewares/file'); 
const { isAuthenticatedUser, authorizeRoles  } = require('../middlewares/auth')

router.post(
    '/upload',
    isAuthenticatedUser, authorizeRoles('admin'),
    upload.single('file'),
    fileUpload
);

module.exports = router;
