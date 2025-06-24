const Exercise = require('../models/exerciseModel');

// Create Exercise
exports.createExercise = async (req, res) => {
  try {
    const { title, content, chapter } = req.body;
    const exercise = await Exercise.create({ title, content, chapter });
    res.status(201).json({ success: true, data: exercise });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All Exercises (optionally filter by chapter)
exports.getAllExercises = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const exercises = await Exercise.find(filter).populate('chapter');
    res.status(200).json({ success: true, data: exercises });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Exercise by ID
exports.getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).populate('chapter');
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.status(200).json({ success: true, data: exercise });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update Exercise
exports.updateExercise = async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedExercise)
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.status(200).json({ success: true, data: updatedExercise });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Exercise
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
