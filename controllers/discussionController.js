const Discussion = require('../models/discussionModel');

// Create a discussion
exports.createDiscussion = async (req, res) => {
  try {
    const data = await Discussion.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all discussions
exports.getAllDiscussions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const data = await Discussion.find(filter).populate('chapter');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single discussion
exports.getDiscussion = async (req, res) => {
  try {
    const data = await Discussion.findById(req.params.id).populate('chapter');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update discussion
exports.updateDiscussion = async (req, res) => {
  try {
    const updated = await Discussion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete discussion
exports.deleteDiscussion = async (req, res) => {
  try {
    const deleted = await Discussion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
