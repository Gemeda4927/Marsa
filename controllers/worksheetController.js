const Worksheet = require('../models/worksheetModel');

// Create a new Worksheet
exports.createWorksheet = async (req, res) => {
  try {
    const { title, content, chapter } = req.body;

    if (!title || !content || !chapter) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and chapter are required'
      });
    }

    const worksheet = await Worksheet.create({ title, content, chapter });

    res.status(201).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all Worksheets (optionally filter by chapter)
exports.getAllWorksheets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const worksheets = await Worksheet.find(filter).populate('chapter');

    res.status(200).json({
      success: true,
      results: worksheets.length,
      data: worksheets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get a single Worksheet by ID
exports.getWorksheet = async (req, res) => {
  try {
    const worksheet = await Worksheet.findById(req.params.id).populate('chapter');

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update a Worksheet by ID
exports.updateWorksheet = async (req, res) => {
  try {
    const updatedWorksheet = await Worksheet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedWorksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedWorksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete a Worksheet by ID
exports.deleteWorksheet = async (req, res) => {
  try {
    const deleted = await Worksheet.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Worksheet deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
