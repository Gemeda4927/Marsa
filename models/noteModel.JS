const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note must have a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    content: {
      type: String,
      required: [true, 'Note must have content'],
      minlength: [5, 'Content must be at least 5 characters'],
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Note must belong to a chapter'],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['general', 'important', 'idea', 'reminder', 'quote', 'code'],
      default: 'general',
    },
    tags: {
      type: [String],
      default: [],
    },
    authorId: {
      type: String,
    },
    isSynced: {
      type: Boolean,
      default: true,
    },
    colorHex: {
      type: String,
      match: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    },
    attachedFiles: {
      type: [String],
      default: [],
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    lastEditedBy: {
      type: String,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    linkedNotes: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);
