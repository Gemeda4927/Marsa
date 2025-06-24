const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const courseController = require('../controllers/courseController');

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: >
 *       Comprehensive course management system for creating, reading,
 *       updating, and deleting courses with multimedia support.
 */

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: "**Create a new course**"
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: |
 *         Create a course with:
 *         - **Title** (3-100 characters)
 *         - **Description** (10-1000 characters)
 *         - Optional **thumbnail image** (JPEG/PNG, max 5MB)
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Node.js"
 *                 description: "Course title (3-100 characters)"
 *               description:
 *                 type: string
 *                 example: "Learn advanced Node.js concepts with hands-on examples."
 *                 description: "Detailed course description (10-1000 characters)"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: "Course thumbnail image file (JPEG/PNG, max 5MB)"
 *     responses:
 *       201:
 *         description: "✅ Course created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: "❌ Bad Request — Validation error or missing input fields"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Title must be between 3 and 100 characters."
 *               errors:
 *                 - field: title
 *                   message: "Title length is invalid."
 *       401:
 *         description: "🔒 Unauthorized — Invalid or missing JWT token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token is missing or invalid."
 *       409:
 *         description: "⚠️ Conflict — Course with the same title already exists"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "A course with this title already exists."
 *       422:
 *         description: "⚠️ Unprocessable Entity — Validation failed for input data"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid data format or constraints violated."
 *       500:
 *         description: "🚨 Internal Server Error — Failed to create course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to create course due to server error."
 * 
 *   get:
 *     summary: "**Retrieve all courses (paginated)**"
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: "Page number for pagination"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: "Number of courses per page (max 100)"
 *     responses:
 *       200:
 *         description: "✅ Courses retrieved successfully with pagination info"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     next:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 2
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                     prev:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: null
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: "❌ Bad Request — Invalid pagination query parameters"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid page or limit value."
 *       500:
 *         description: "🚨 Internal Server Error — Failed to retrieve courses"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to retrieve courses due to server error."
 */

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: "**Retrieve a single course by its ID**"
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "5f8d04b3ab35de3a3427d8f3"
 *         description: "Unique MongoDB ObjectID of the course"
 *     responses:
 *       200:
 *         description: "✅ Course retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: "❌ Bad Request — Invalid course ID format"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid course ID format."
 *       404:
 *         description: "❌ Course not found with the given ID"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       500:
 *         description: "🚨 Internal Server Error — Failed to retrieve course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to retrieve course due to server error."
 * 
 *   patch:
 *     summary: "**Update a course by its ID**"
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "Unique MongoDB ObjectID of the course to update"
 *     requestBody:
 *       description: "Fields to update (title, description, and/or thumbnail)"
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Node.js Course"
 *                 description: "New title of the course (optional)"
 *               description:
 *                 type: string
 *                 example: "Updated description with new lessons."
 *                 description: "New description of the course (optional)"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: "New thumbnail image file (optional)"
 *     responses:
 *       200:
 *         description: "✅ Course updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: "❌ Bad Request — Validation error or no update fields provided"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "No valid fields provided for update."
 *       401:
 *         description: "🔒 Unauthorized — Invalid or missing JWT token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token is missing or invalid."
 *       403:
 *         description: "⛔ Forbidden — User not authorized to update this course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You do not have permission to update this course."
 *       404:
 *         description: "❌ Course not found"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       409:
 *         description: "⚠️ Conflict — Update conflicts with existing data"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Update conflicts with existing course data."
 *       422:
 *         description: "⚠️ Unprocessable Entity — Validation failed for input data"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid data format or constraints violated."
 *       500:
 *         description: "🚨 Internal Server Error — Failed to update course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to update course due to server error."
 * 
 *   delete:
 *     summary: "**Delete a course by its ID**"
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "Unique MongoDB ObjectID of the course to delete"
 *     responses:
 *       204:
 *         description: "✅ Course deleted successfully (no content returned)"
 *       400:
 *         description: "❌ Bad Request — Invalid course ID format"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid course ID format."
 *       401:
 *         description: "🔒 Unauthorized — Invalid or missing JWT token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token is missing or invalid."
 *       403:
 *         description: "⛔ Forbidden — User not authorized to delete this course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You do not have permission to delete this course."
 *       404:
 *         description: "❌ Course not found"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       500:
 *         description: "🚨 Internal Server Error — Failed to delete course"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to delete course due to server error."
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - _id
 *         - title
 *         - description
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d04b3ab35de3a3427d8f3"
 *           description: "Auto-generated MongoDB ObjectID"
 *         title:
 *           type: string
 *           example: "Advanced Node.js"
 *           description: "Course title"
 *         description:
 *           type: string
 *           example: "Learn advanced Node.js concepts with practical examples."
 *           description: "Course detailed description"
 *         thumbnail:
 *           type: string
 *           example: "uploads/thumbnail-12345.jpg"
 *           description: "URL path to the course thumbnail image"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-15T10:00:00Z"
 *           description: "Timestamp when the course was created"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-16T15:30:00Z"
 *           description: "Timestamp when the course was last updated"
 * 
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error message describing the issue"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "title"
 *               message:
 *                 type: string
 *                 example: "Title length is invalid."
 */

router.route('/')
  .post(upload.single('thumbnail'), courseController.createCourse)
  .get(courseController.getAllCourses);

router.route('/:id')
  .get(courseController.getCourse)
  .patch(upload.single('thumbnail'), courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
