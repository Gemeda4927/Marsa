const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: `chapters/videos/${req.params.id || 'temp'}`,
      allowed_formats: ['mp4', 'webm', 'mov', 'mkv'],
      resource_type: 'video',
      transformation: [
        { width: 1280, height: 720, crop: 'limit' },
        { quality: 'auto' },
        { format: 'mp4' }
      ],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const videoUpload = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('video');

module.exports = { videoUpload };