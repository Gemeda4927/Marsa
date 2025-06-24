const Chapter = require('../models/chapterModel');
const cloudinary = require('../config/cloudinary');

// ==================== Helper Functions ====================
const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
  try {
    if (!fileBuffer || !mimetype || !folder) {
      throw new Error('Missing required parameters for upload');
    }

    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;
    const resourceType = mimetype.startsWith('video')
      ? 'video'
      : mimetype.startsWith('audio')
      ? 'audio'
      : 'image';

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `edu-platform/${folder}`,
      resource_type: resourceType,
      timeout: 30000,
      chunk_size: 6000000,
    });

    return result;
  } catch (err) {
    console.error('Cloudinary Upload Error:', {
      error: err.message,
      type: mimetype,
      size: fileBuffer?.length,
    });
    throw err;
  }
};

// ==================== Controller Methods ====================

// Create Chapter
exports.createChapter = async (req, res) => {
  try {
    const { title, content, course, order } = req.body;

    if (!title || !content || !course) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and course reference',
      });
    }

    let media = {};
    const uploadPromises = [];

    if (req.files?.video?.[0]) {
      uploadPromises.push(
        uploadToCloudinary(
          req.files.video[0].buffer,
          req.files.video[0].mimetype,
          'chapters/videos'
        ).then((result) => {
          media.video = result.secure_url;
        })
      );
    }

    if (req.files?.audio?.[0]) {
      uploadPromises.push(
        uploadToCloudinary(
          req.files.audio[0].buffer,
          req.files.audio[0].mimetype,
          'chapters/audios'
        ).then((result) => {
          media.audio = result.secure_url;
        })
      );
    }

    await Promise.all(uploadPromises);

    const chapter = await Chapter.create({
      title,
      content,
      course,
      order,
      ...media,
    });

    return res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter,
    });
  } catch (err) {
    console.error('Create Chapter Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not create chapter',
    });
  }
};

// Get All Chapters
exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find()
      .populate('note')
      .populate('worksheet')
      .populate('exercise')
      .populate('quiz')
      .populate('assignment')
      .populate('codetask')
      .populate('summary')
      .populate('learningoutcome')
      .populate('previousexam')
      .populate('discussion')
      .populate('resourcelink')
      .populate('completionstatus')
      .populate('livesession')
      .populate('projecttask');

    return res.status(200).json({
      success: true,
      results: chapters.length,
      data: chapters,
    });
  } catch (err) {
    console.error('Get Chapters Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch chapters',
    });
  }
};

// Get Single Chapter
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('note')
      .populate('worksheet')
      .populate('exercise')
      .populate('quiz')
      .populate('assignment')
      .populate('codetask')
      .populate('summary')
      .populate('learningoutcome')
      .populate('previousexam')
      .populate('discussion')
      .populate('resourcelink')
      .populate('completionstatus')
      .populate('livesession')
      .populate('projecttask');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (err) {
    console.error('Get Chapter Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch chapter',
    });
  }
};

// Update Chapter
exports.updateChapter = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const uploadPromises = [];

    if (req.files?.video?.[0]) {
      uploadPromises.push(
        uploadToCloudinary(
          req.files.video[0].buffer,
          req.files.video[0].mimetype,
          'chapters/videos'
        ).then((result) => {
          updateData.video = result.secure_url;
        })
      );
    }

    if (req.files?.audio?.[0]) {
      uploadPromises.push(
        uploadToCloudinary(
          req.files.audio[0].buffer,
          req.files.audio[0].mimetype,
          'chapters/audios'
        ).then((result) => {
          updateData.audio = result.secure_url;
        })
      );
    }

    await Promise.all(uploadPromises);

    const chapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('course');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter,
    });
  } catch (err) {
    console.error('Update Chapter Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not update chapter',
    });
  }
};

// Delete Chapter
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
      data: null,
    });
  } catch (err) {
    console.error('Delete Chapter Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not delete chapter',
    });
  }
};
