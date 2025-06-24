const LearningOutcome = require('../models/learningOutcomeModel');

// Create
exports.createLearningOutcome = async (req, res) => {
  try {
    const data = await LearningOutcome.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All
exports.getAllLearningOutcomes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const data = await LearningOutcome.find(filter).populate('chapter');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get One
exports.getLearningOutcome = async (req, res) => {
  try {
    const data = await LearningOutcome.findById(req.params.id).populate('chapter');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update
exports.updateLearningOutcome = async (req, res) => {
  try {
    const updated = await LearningOutcome.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deleteLearningOutcome = async (req, res) => {
  try {
    const deleted = await LearningOutcome.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
