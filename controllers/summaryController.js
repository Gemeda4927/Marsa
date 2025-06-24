const Summary = require('../models/summaryModel');

// Create Summary
exports.createSummary = async (req, res) => {
  try {
    const summary = await Summary.create(req.body);
    res.status(201).json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All Summaries
exports.getAllSummaries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const summaries = await Summary.find(filter).populate('chapter');
    res.status(200).json({ success: true, data: summaries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get One Summary
exports.getSummary = async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id).populate('chapter');
    if (!summary) return res.status(404).json({ success: false, message: 'Summary not found' });

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update Summary
exports.updateSummary = async (req, res) => {
  try {
    const updated = await Summary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Summary not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Summary
exports.deleteSummary = async (req, res) => {
  try {
    const deleted = await Summary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Summary not found' });

    res.status(200).json({ success: true, message: 'Summary deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
