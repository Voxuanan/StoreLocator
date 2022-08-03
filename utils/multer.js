const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, callback) => {
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const checkFileType = (file, callback) => {
    const filetypes = /jpeg|png|jpg|gif/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return callback(null, true);
    } else {
        callback("Error: Image Only!", false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    },
}).single("imageUpload");

const uploadMutiple = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    },
}).array("imageUpload", 10);

module.exports = { upload, uploadMutiple };
