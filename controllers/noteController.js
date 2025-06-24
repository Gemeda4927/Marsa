const Note = require('../models/noteModel.js');

// Create Note
exports.createNote = async (req, res) => {
  try {
    const {
      title,
      content,
      chapter,
      isPinned,
      type,
      tags,
      authorId,
      isSynced,
      colorHex,
      attachedFiles,
      isEncrypted,
      passwordHash,
      version,
      lastEditedBy,
      favoriteCount,
      linkedNotes,
    } = req.body;

    const note = await Note.create({
      title,
      content,
      chapter,
      isPinned,
      type,
      tags,
      authorId,
      isSynced,
      colorHex,
      attachedFiles,
      isEncrypted,
      passwordHash,
      version,
      lastEditedBy,
      favoriteCount,
      linkedNotes,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors, // validation errors if any
    });
  }
};

// Get All Notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('chapter');

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single Note by ID
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('chapter');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Note
exports.updateNote = async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedNote,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
