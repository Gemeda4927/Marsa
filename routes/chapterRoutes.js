const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const courseController = require('../controllers/courseController');

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: API for managing courses, including creation, retrieval, updating, and deletion with multimedia support.
 */

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Create a course with title, description, and optional thumbnail image.
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
 *                 description: Course title, 3-100 characters
 *               description:
 *                 type: string
 *                 example: "In-depth Node.js concepts with practical examples."
 *                 description: Course description, 10-1000 characters
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional thumbnail image (JPEG/PNG, max 5MB)
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input data
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token missing or invalid."
 *       500:
 *         description: Server error during course creation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to create course due to server error."
 * 
 *   get:
 *     summary: Retrieve paginated list of courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number (starting at 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of courses per page
 *     responses:
 *       200:
 *         description: List of courses with pagination metadata
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
 *                           nullable: true
 *                           example: null
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error while fetching courses
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
 *     summary: Retrieve course details by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "5f8d04b3ab35de3a3427d8f3"
 *         description: Unique ID of the course
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       500:
 *         description: Server error while retrieving course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to retrieve course due to server error."
 * 
 *   patch:
 *     summary: Update course details by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the course to update
 *     requestBody:
 *       description: Fields to update: title, description, and/or thumbnail image
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Node.js Course"
 *                 description: Optional new title
 *               description:
 *                 type: string
 *                 example: "Updated course description."
 *                 description: Optional new description
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional new thumbnail image
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error or no fields provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "No valid fields provided for update."
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token missing or invalid."
 *       403:
 *         description: Forbidden - user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You do not have permission to update this course."
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       500:
 *         description: Server error during update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to update course due to server error."
 * 
 *   delete:
 *     summary: Delete course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the course to delete
 *     responses:
 *       204:
 *         description: Course deleted successfully, no content returned
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication token missing or invalid."
 *       403:
 *         description: Forbidden - user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "You do not have permission to delete this course."
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Course not found."
 *       500:
 *         description: Server error during deletion
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
 *           description: Auto-generated MongoDB ObjectID
 *         title:
 *           type: string
 *           example: "Advanced Node.js"
 *           description: Course title
 *         description:
 *           type: string
 *           example: "Learn advanced Node.js concepts with practical examples."
 *           description: Detailed course description
 *         thumbnail:
 *           type: string
 *           example: "uploads/thumbnail-12345.jpg"
 *           description: URL path to the course thumbnail image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-15T10:00:00Z"
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-16T15:30:00Z"
 *           description: Last update timestamp
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
