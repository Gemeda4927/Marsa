const mongoose = require('mongoose');
const validator = require('validator');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note must have a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      validate: {
        validator: function(v) {
          return !validator.contains(v, '<script>', { ignoreCase: true });
        },
        message: 'Title contains invalid characters'
      }
    },
    content: {
      type: String,
      required: [true, 'Note must have content'],
      minlength: [5, 'Content must be at least 5 characters'],
      maxlength: [10000, 'Content cannot exceed 10,000 characters'],
      validate: {
        validator: function(v) {
          return !validator.contains(v, '<script>', { ignoreCase: true });
        },
        message: 'Content contains potentially unsafe HTML'
      }
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Note must belong to a chapter'],
      validate: {
        validator: async function(v) {
          const chapter = await mongoose.model('Chapter').findById(v);
          return chapter !== null;
        },
        message: 'Chapter does not exist'
      }
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: {
        values: ['general', 'important', 'idea', 'reminder', 'quote', 'code'],
        message: 'Note type is either: general, important, idea, reminder, quote, or code'
      },
      default: 'general',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 10 && arr.every(tag => 
            typeof tag === 'string' && 
            tag.trim().length > 0 && 
            tag.length <= 30 &&
            !validator.contains(tag, '<script>', { ignoreCase: true })
          );
        },
        message: 'Tags must be strings (max 30 chars each), max 10 tags allowed'
      }
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must have an author'],
    },
    isSynced: {
      type: Boolean,
      default: true,
    },
    colorHex: {
      type: String,
      match: [/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color code'],
      default: '#ffffff'
    },
    attachedFiles: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5 && arr.every(file => 
            validator.isURL(file, { protocols: ['http', 'https'], require_protocol: true })
          );
        },
        message: 'Each file must be a valid URL (max 5 files)'
      }
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
      select: false,
      validate: {
        validator: function(v) {
          if (this.isEncrypted) {
            return v && v.length >= 60;
          }
          return true;
        },
        message: 'Password hash is required when note is encrypted'
      }
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version cannot be less than 1']
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: [0, 'Favorite count cannot be negative']
    },
    linkedNotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Note',
      default: [],
      validate: {
        validator: async function(arr) {
          if (arr.length > 10) return false;
          const notes = await mongoose.model('Note').find({ _id: { $in: arr } });
          return notes.length === arr.length;
        },
        message: 'Invalid note references or maximum of 10 linked notes exceeded'
      }
    },
    accessList: {
      type: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        permission: {
          type: String,
          enum: ['view', 'edit']
        }
      }],
      default: []
    },
    history: {
      type: [{
        content: String,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        editedAt: {
          type: Date,
          default: Date.now
        },
        version: Number
      }],
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ chapter: 1 });
noteSchema.index({ authorId: 1 });
noteSchema.index({ isPinned: 1 });
noteSchema.index({ type: 1 });
noteSchema.index({ tags: 1 });

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  return this.content ? this.content.trim().split(/\s+/).length : 0;
});

// Middleware to validate linked notes don't create circular references
noteSchema.pre('save', async function(next) {
  if (this.linkedNotes && this.linkedNotes.length > 0) {
    if (this.linkedNotes.some(noteId => noteId.equals(this._id))) {
      return next(new Error('Cannot link a note to itself'));
    }
  }
  next();
});

// Middleware to maintain version history
noteSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.history.push({
      content: this.content,
      editedBy: this.lastEditedBy,
      version: this.version
    });
    this.version += 1;
  }
  next();
});

// Query middleware to exclude encrypted notes by default unless specifically requested
noteSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeEncrypted) {
    this.find({ isEncrypted: false });
  }
  next();
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;