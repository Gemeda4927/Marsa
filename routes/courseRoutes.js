const express = require('express');
const router = express.Router();

// Example routes
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { courses: [] }
  });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { course: { id: req.params.id } }
  });
});

module.exports = router;