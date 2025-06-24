const ProjectTask = require('../models/projectTaskModel');

// Create
exports.createProjectTask = async (req, res) => {
  try {
    const data = await ProjectTask.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all
exports.getAllProjectTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const data = await ProjectTask.find(filter).populate('chapter');

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single
exports.getProjectTask = async (req, res) => {
  try {
    const data = await ProjectTask.findById(req.params.id).populate('chapter');

    if (!data) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update
exports.updateProjectTask = async (req, res) => {
  try {
    const updated = await ProjectTask.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deleteProjectTask = async (req, res) => {
  try {
    const deleted = await ProjectTask.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
