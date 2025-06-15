const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chapters/videos',
    resource_type: 'video',
    format: async (req, file) => 'mp4', // force mp4 for consistency (or get from file)
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const videoUpload = multer({ storage });

module.exports = videoUpload;
