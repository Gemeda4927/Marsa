const CompletionStatus = require('../models/completionStatusModel');

// Create
exports.createCompletionStatus = async (req, res) => {
  try {
    const data = await CompletionStatus.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all
exports.getAllCompletionStatus = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;
    if (req.query.user) filter.user = req.query.user;

    const data = await CompletionStatus.find(filter)
      .populate('chapter')
      .populate('user');

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single
exports.getCompletionStatus = async (req, res) => {
  try {
    const data = await CompletionStatus.findById(req.params.id)
      .populate('chapter')
      .populate('user');

    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update
exports.updateCompletionStatus = async (req, res) => {
  try {
    const updated = await CompletionStatus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete
exports.deleteCompletionStatus = async (req, res) => {
  try {
    const deleted = await CompletionStatus.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
