// const multer = require('multer');

// const storage = multer.memoryStorage(); 
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, 
// });

// module.exports = upload;


// middlewares/file.js
const multer = require('multer');

// Define storage for the files
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Path where you want to store files
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split('/');
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension); // Naming the file
    }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
