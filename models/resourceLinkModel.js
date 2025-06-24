const mongoose = require('mongoose');

const resourceLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource must have a title'],
      minlength: [3, 'Title must be at least 3 characters']
    },
    url: {
      type: String,
      required: [true, 'Resource must have a URL'],
      validate: {
        validator: v => /^(https?:\/\/)/.test(v),
        message: props => `${props.value} is not a valid URL`
      }
    },
    description: {
      type: String,
      default: ''
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Resource must belong to a chapter']
    },
    type: {
      type: String,
      enum: ['Article', 'Video', 'Documentation', 'Tool', 'External', 'PDF'],
      default: 'Article'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ResourceLink', resourceLinkSchema);
