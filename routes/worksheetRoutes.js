const express = require('express');
const worksheetController = require('../controllers/worksheetController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Worksheets
 *   description: API for managing worksheets and their questions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Worksheet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665c2cf13c2f4c001c1e03a3"
 *         title:
 *           type: string
 *           example: "Algebra Basics"
 *         description:
 *           type: string
 *           example: "Intro to Algebra"
 *         chapter:
 *           type: string
 *           example: "60f7d839f9fd4c001c8f1e99"
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         stats:
 *           type: object
 *           properties:
 *             totalQuestions:
 *               type: integer
 *               example: 1
 *             completedQuestions:
 *               type: integer
 *               example: 1
 *             accuracy:
 *               type: number
 *               example: 100
 *             averageTime:
 *               type: number
 *               example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     WorksheetInput:
 *       type: object
 *       required: [title, chapter]
 *       properties:
 *         title:
 *           type: string
 *           example: "Algebra Basics"
 *         description:
 *           type: string
 *           example: "Basic worksheet"
 *         chapter:
 *           type: string
 *           example: "60f7d839f9fd4c001c8f1e99"
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *
 *     Question:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [MCQ, Short Answer, Problem Solving, Theory]
 *         question:
 *           type: string
 *           example: "What is 2 + 2?"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example: ["2", "3", "4", "5"]
 *         correctAnswer:
 *           type: integer
 *           example: 2
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: "Easy"
 *         explanation:
 *           type: string
 *           example: "2 + 2 = 4"
 *         solution:
 *           type: string
 *           example: "Add the two numbers"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["math"]
 *         bookmarked:
 *           type: boolean
 *           example: false
 *         completed:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /worksheets:
 *   get:
 *     summary: Get all worksheets
 *     tags: [Worksheets]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: List of worksheets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Worksheet'
 *   post:
 *     summary: Create a new worksheet
 *     tags: [Worksheets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorksheetInput'
 *     responses:
 *       201:
 *         description: Worksheet created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worksheet'
 */

/**
 * @swagger
 * /worksheets/{id}:
 *   get:
 *     summary: Get a worksheet by ID
 *     tags: [Worksheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the worksheet
 *     responses:
 *       200:
 *         description: Worksheet found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worksheet'
 *       404:
 *         description: Worksheet not found
 *   patch:
 *     summary: Update a worksheet
 *     tags: [Worksheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the worksheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorksheetInput'
 *     responses:
 *       200:
 *         description: Worksheet updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worksheet'
 *   delete:
 *     summary: Delete a worksheet
 *     tags: [Worksheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the worksheet
 *     responses:
 *       200:
 *         description: Worksheet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Worksheet not found
 */

// Worksheet routes
router
  .route('/')
  .get(worksheetController.getAllWorksheets)
  .post(worksheetController.createWorksheet);

router
  .route('/:id')
  .get(worksheetController.getWorksheet)
  .patch(worksheetController.updateWorksheet)
  .delete(worksheetController.deleteWorksheet);

module.exports = router;
