// controllers/fileController.js
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require('cloudinary')

exports.fileUpload = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body); 
        console.log(req.file); 

        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "file not found",
            });
        } else {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "avatars",
                allowedFormats: ['png', 'jpg', 'jpeg'],
                width: 150,
                crop: "scale",
            })
            console.log("result - ", result)
            res.status(200).send({
                status: "success", 
                message: `${req.file.originalname} uploaded!`
            })
        }
          

    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "error", error: err.message });
    }
});


