const LiveSession = require('../models/liveSessionModel');

// Create
exports.createLiveSession = async (req, res) => {
  try {
    const data = await LiveSession.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all
exports.getAllLiveSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const data = await LiveSession.find(filter).populate('chapter');

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single
exports.getLiveSession = async (req, res) => {
  try {
    const data = await LiveSession.findById(req.params.id).populate('chapter');

    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update
exports.updateLiveSession = async (req, res) => {
  try {
    const updated = await LiveSession.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deleteLiveSession = async (req, res) => {
  try {
    const deleted = await LiveSession.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
