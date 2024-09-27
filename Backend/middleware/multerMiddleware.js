const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Export the upload instance using CommonJS syntax
const upload = multer({ storage });

module.exports = upload; // Export the upload instance
