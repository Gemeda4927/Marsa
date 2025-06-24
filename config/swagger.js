const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marsa E-Learning Platform API',
      version: '1.0.0',
      description: `
        🚀 Welcome to the Marsa E-Learning Platform API documentation.
        This RESTful API supports full lifecycle management of courses,
        chapters, users, enrollments, and more within a secure, scalable,
        and user-friendly e-learning environment.

        Explore endpoints to create, update, delete, and retrieve resources,
        all protected via JWT-based authentication with role-based access control.
      `,
      termsOfService: 'https://marsa-elearning.com/terms',
      contact: {
        name: 'Marsa Support Team',
        email: 'support@marsa-elearning.com',
        url: 'https://marsa-elearning.com/contact',
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.marsa-elearning.com',
        description: 'Production Server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User account management and profile operations',
      },
      {
        name: 'Courses',
        description: 'Manage courses: creation, retrieval, update, and deletion',
      },
      {
        name: 'Chapters',
        description: 'Manage chapters within courses including multimedia uploads',
      },
      {
        name: 'Enrollments',
        description: 'Handle course enrollments, progress, and certificates',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme. Example: "Bearer {token}"',
        },
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination (starts from 1)',
          required: false,
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1,
          },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page (max 100)',
          required: false,
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication failed or missing credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Authentication token missing or invalid.' },
            },
          },
        },
        Forbidden: {
          description: 'User does not have permission for this action',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'You do not have permission to perform this action.' },
            },
          },
        },
        NotFound: {
          description: 'Requested resource was not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Resource not found.' },
            },
          },
        },
        BadRequest: {
          description: 'Invalid input or validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Validation error.',
                errors: [
                  { field: 'title', message: 'Title length must be between 3 and 100 characters.' },
                ],
              },
            },
          },
        },
        InternalServerError: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'An unexpected error occurred on the server.' },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error message describing the issue.',
            },
            errors: {
              type: 'array',
              description: 'Array of field-specific validation errors',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'title' },
                  message: { type: 'string', example: 'Title length is invalid.' },
                },
              },
            },
          },
        },
        Course: {
          type: 'object',
          required: ['_id', 'title', 'description', 'createdAt', 'updatedAt'],
          properties: {
            _id: {
              type: 'string',
              example: '5f8d04b3ab35de3a3427d8f3',
              description: 'MongoDB ObjectID',
            },
            title: {
              type: 'string',
              example: 'Advanced Node.js',
              description: 'Course title',
            },
            description: {
              type: 'string',
              example: 'Learn advanced Node.js concepts with hands-on projects.',
              description: 'Detailed course description',
            },
            thumbnail: {
              type: 'string',
              example: 'uploads/thumbnail-12345.jpg',
              description: 'URL or path to course thumbnail image',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-15T10:00:00Z',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-16T15:30:00Z',
              description: 'Last update timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
