const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    console.log('Incoming file MIME type:', file.mimetype); // Debug
    
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video or audio files are allowed!'), false);
    }
  }
});

module.exports = upload;