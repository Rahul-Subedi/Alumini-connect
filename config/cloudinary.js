// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MODIFIED: We are now using a function for the params to be more explicit
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // This function checks the file type and sets the correct folder and resource_type
    let folder;
    let resource_type;

    if (file.mimetype.startsWith('image/')) {
      folder = 'alumni-verification-docs/images';
      resource_type = 'image';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'alumni-verification-docs/pdfs';
      resource_type = 'raw'; // This explicitly tells Cloudinary to treat this as a document/raw file
    } else {
      folder = 'alumni-verification-docs/other';
      resource_type = 'auto';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'pdf']
    };
  }
});

const upload = multer({ storage: storage });

module.exports = upload;