const Assignment = require('../models/assignmentModel');

// Create Assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, content, chapter, dueDate } = req.body;
    const assignment = await Assignment.create({ title, content, chapter, dueDate });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All Assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const assignments = await Assignment.find(filter).populate('chapter');

    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('chapter');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update Assignment
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
