const CodeTask = require('../models/codeTaskModel');

// Create CodeTask
exports.createCodeTask = async (req, res) => {
  try {
    const task = await CodeTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All CodeTasks
exports.getAllCodeTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const tasks = await CodeTask.find(filter).populate('chapter');
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single CodeTask
exports.getCodeTask = async (req, res) => {
  try {
    const task = await CodeTask.findById(req.params.id).populate('chapter');
    if (!task) return res.status(404).json({ success: false, message: 'CodeTask not found' });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update CodeTask
exports.updateCodeTask = async (req, res) => {
  try {
    const updated = await CodeTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ success: false, message: 'CodeTask not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete CodeTask
exports.deleteCodeTask = async (req, res) => {
  try {
    const deleted = await CodeTask.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'CodeTask not found' });

    res.status(200).json({ success: true, message: 'CodeTask deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
