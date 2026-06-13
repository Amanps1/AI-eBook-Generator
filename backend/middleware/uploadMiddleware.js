const multer = require('multer');
const path = require('path');
const fs = require('fs');

// create the upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

//initialize upload with error handling
const upload = multer({
    storage:storage,
    limits:{fileSize:2*1024*1024},
    fileFilter:function(req,file,cb){
        const filetypes=/jpeg|jpg|png/;
        const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype=filetypes.test(file.mimetype);
        
        if(mimetype && extname){
            cb(null,true);
        }else{
            cb(new Error("Only image files are allowed!"));
        }
    }
}).single('coverImage');

module.exports={upload};