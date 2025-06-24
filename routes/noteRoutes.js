const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.route('/')
  .post(noteController.createNote)
  .get(noteController.getAllNotes);

router.route('/:id')
  .get(noteController.getNote)
  .put(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;