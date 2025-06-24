const PreviousExam = require('../models/previousExamModel');

// Create
exports.createPreviousExam = async (req, res) => {
  try {
    const data = await PreviousExam.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All
exports.getAllPreviousExams = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const data = await PreviousExam.find(filter).populate('chapter');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get One
exports.getPreviousExam = async (req, res) => {
  try {
    const data = await PreviousExam.findById(req.params.id).populate('chapter');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update
exports.updatePreviousExam = async (req, res) => {
  try {
    const updated = await PreviousExam.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deletePreviousExam = async (req, res) => {
  try {
    const deleted = await PreviousExam.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
