const http = require("http");
const express = require("express");
require("dotenv").config({ path: __dirname + "/config/.env" });
const cookieParser = require("cookie-parser");
const useragent = require("express-useragent");
const expressip = require("express-ip");

require("./config/db");
const errorHandler = require("./middleware/error");
const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");
const siteSettingsRouter = require("./routers/sitesettings");
const surveyrouter = require("./routers/surveycreation");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express")
const Survey = require('./models/surveycreation');
const responses = require('./models/responsemodel')
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const crypto = require("crypto");
const auth = require("./middleware/auth-surveycreator")

AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

var aws_s3_upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: process.env.AWS_S3_UPLOAD_URL + "/popcorn",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: async function (req, file, cb) {
      cb(
        null,
        (
          Date.now() + (await crypto.randomBytes(20).toString("hex"))
        ).toUpperCase()
      );
    },
  }),
  limits: { fileSize: 1024 * 1024 * 25 },
});

const { seedSettings } = require("./services/db-seed");
seedSettings();


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.use(expressip().getIpInfoMiddleware);


const API_KEY = '453432453454453613434499'; 



const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: 'API key is missing',
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({
      status: 403,
      success: false,
      message: 'Invalid API key',
    });
  }

  next();
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Popcorn API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://api.mypopcorn.io/'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        }
      }
    },
    security: [{
      ApiKeyAuth: []
    }],
  },
  apis: ['./index.js'], 
}; 

const swaggerSpec = swaggerJSDoc(options);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));





/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: Get all surveys
 *     description: Retrieve all surveys with populated questions and survey responses.
 *     tags:
 *       - Surveys
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: A list of all surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "66cf5d868781fb3bd6d84a58"
 *                   user_id:
 *                     type: string
 *                     example: "66cd97ac5b28fb0ac8261b73"
 *                   logo:
 *                     type: string
 *                     example: "http://example.com/logo.png"
 *                   title:
 *                     type: string
 *                     example: "Customer Survey"
 *                   description:
 *                     type: string
 *                     example: "This survey aims to gather customer feedback."
 *                   category:
 *                     type: string
 *                     example: "Customer Feedback"
 *                   surveylink:
 *                     type: string
 *                     example: "https://example.com/survey/1234"
 *                   reward_points:
 *                     type: number
 *                     example: 1
 *                   createdby:
 *                     type: string
 *                     example: "bharath"
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "66cf5da58781fb3bd6d84a5c"
 *                         survey:
 *                           type: string
 *                           example: "66cf5d868781fb3bd6d84a58"
 *                         questionText:
 *                           type: string
 *                           example: "How satisfied are you with our service?"
 *                         questionType:
 *                           type: string
 *                           example: "multiple_choice"
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "Very satisfied"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-28T17:25:57.973Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-28T17:25:57.973Z"
 *                   surveyresponse:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "66cf5ed88781fb3bd6d84a7a"
 *                         survey_id:
 *                           type: string
 *                           example: "66cf5d868781fb3bd6d84a58"
 *                         user_id:
 *                           type: string
 *                           example: "66cf5e408781fb3bd6d84a6b"
 *                         answers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               question_id:
 *                                 type: string
 *                                 example: "66cf5da58781fb3bd6d84a5c"
 *                               answer:
 *                                 type: string
 *                                 example: "Very satisfied"
 *                         status:
 *                           type: string
 *                           example: "Answered"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-28T17:31:17.971Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-28T17:31:17.971Z"
 *                   status:
 *                     type: boolean
 *                     example: true
 *                   deleted:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-28T17:25:26.186Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-28T17:31:17.995Z"
 *       401:
 *         description: API key is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key is missing"
 *       403:
 *         description: Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */


app.get('/surveys', apiKeyMiddleware, async (req, res) => {
  try {
    const surveys = await Survey.find({
      questions: { $ne: [] },
      surveylink: { $exists: true, $ne: "" }
    })
      .populate('questions')
      .populate('surveyresponse');

    res.status(200).json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal server error',
    });
  }
});



/**
 * @swagger
 * /surveys/by-title:
 *   post:
 *     summary: Get surveys by title
 *     description: Retrieves surveys based on the provided title in the request body. The search is case-insensitive.You can get the survey name from above API response.
 *     tags:
 *       - Survey
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Title of the survey to search for
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Customer Satisfaction Survey"
 *     responses:
 *       200:
 *         description: Successful retrieval of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Surveys retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66cf5d868781fb3bd6d84a58"
 *                       user_id:
 *                         type: string
 *                         example: "66cd97ac5b28fb0ac8261b73"
 *                       logo:
 *                         type: string
 *                         example: "http://example.com/logo.png"
 *                       title:
 *                         type: string
 *                         example: "Customer Satisfaction Survey"
 *                       description:
 *                         type: string
 *                         example: "This survey aims to gather customer feedback."
 *                       category:
 *                         type: string
 *                         example: "Customer Feedback"
 *                       reward_points:
 *                         type: integer
 *                         example: 1
 *                       createdby:
 *                         type: string
 *                         example: "bharath"
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "66cf5da58781fb3bd6d84a5c"
 *                             survey:
 *                               type: string
 *                               example: "66cf5d868781fb3bd6d84a58"
 *                             questionText:
 *                               type: string
 *                               example: "How satisfied are you with our service?"
 *                             questionType:
 *                               type: string
 *                               example: "multiple_choice"
 *                             options:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-08-28T17:25:57.973Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-08-28T17:25:57.973Z"
 *                       surveyresponse:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "66cf5ed88781fb3bd6d84a7a"
 *                             survey_id:
 *                               type: string
 *                               example: "66cf5d868781fb3bd6d84a58"
 *                             user_id:
 *                               type: string
 *                               example: "66cf5e408781fb3bd6d84a6b"
 *                             answers:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   question_id:
 *                                     type: string
 *                                     example: "66cf5da58781fb3bd6d84a5c"
 *                                   answer:
 *                                     type: string
 *                                     example: "Very satisfied"
 *                             status:
 *                               type: string
 *                               example: "Answered"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-08-28T17:31:17.971Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-08-28T17:31:17.971Z"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       deleted:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:25:26.186Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:31:17.995Z"
 *                       surveylink:
 *                         type: string
 *                         example: "https://search.yahoo.com/search?fr2=p%3ads%2cv%3aomn%2cm%3asa%2cbrws%3achrome%2cpos%3a1&fr=mcafee&type=E210US885G0&p=link+to+document+converter"
 *       400:
 *         description: Bad request (title is required in the request body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Title is required in the request body
 *       404:
 *         description: No surveys found with the given title
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No surveys found with the given title
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


app.post('/surveys/by-title', apiKeyMiddleware , async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Title is required in the request body',
      });
    }
    
    const surveys = await Survey.find({ title: new RegExp(title, 'i') }) // Case-insensitive search
      .populate('questions')
      .populate('surveyresponse');

    if (surveys.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'No surveys found with the given title',
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: surveys,
      message: 'Surveys retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching surveys by title:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal server error',
    });
  }
});



/**
 * @swagger
 * /survey/by-id:
 *   post:
 *     summary: Get survey by ID
 *     description: Retrieves a survey based on the provided ID in the request body. You can get the survey ID from above API response.
 *     tags:
 *       - Survey
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: ID of the survey to retrieve
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "66cf5d868781fb3bd6d84a58"
 *     responses:
 *       200:
 *         description: Successful retrieval of the survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Survey retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "66cf5d868781fb3bd6d84a58"
 *                     user_id:
 *                       type: string
 *                       example: "66cd97ac5b28fb0ac8261b73"
 *                     logo:
 *                       type: string
 *                       example: "http://example.com/logo.png"
 *                     title:
 *                       type: string
 *                       example: "Customer Survey"
 *                     description:
 *                       type: string
 *                       example: "This survey aims to gather customer feedback."
 *                     category:
 *                       type: string
 *                       example: "Customer Feedback"
 *                     reward_points:
 *                       type: integer
 *                       example: 1
 *                     createdby:
 *                       type: string
 *                       example: "bharath"
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "66cf5da58781fb3bd6d84a5c"
 *                           survey:
 *                             type: string
 *                             example: "66cf5d868781fb3bd6d84a58"
 *                           questionText:
 *                             type: string
 *                             example: "How satisfied are you with our service?"
 *                           questionType:
 *                             type: string
 *                             example: "multiple_choice"
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "Very satisfied"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-28T17:25:57.973Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-28T17:25:57.973Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                     surveyresponse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "66cf5ed88781fb3bd6d84a7a"
 *                           survey_id:
 *                             type: string
 *                             example: "66cf5d868781fb3bd6d84a58"
 *                           user_id:
 *                             type: string
 *                             example: "66cf5e408781fb3bd6d84a6b"
 *                           answers:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 question_id:
 *                                   type: string
 *                                   example: "66cf5da58781fb3bd6d84a5c"
 *                                 answer:
 *                                   type: string
 *                                   example: "Very satisfied"
 *                           status:
 *                             type: string
 *                             example: "Answered"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-28T17:31:17.971Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-28T17:31:17.971Z"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     deleted:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-28T17:25:26.186Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-28T17:31:17.995Z"
 *                     surveylink:
 *                       type: string
 *                       example: "https://search.yahoo.com/search?fr2=p%3ads%2cv%3aomn%2cm%3asa%2cbrws%3achrome%2cpos%3a1&fr=mcafee&type=E210US885G0&p=link+to+document+converter"
 *       400:
 *         description: Bad request (survey ID is required in the request body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Survey ID is required in the request body
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Survey not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */




app.post('/survey/by-id',apiKeyMiddleware , async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Survey ID is required in the request body',
      });
    }

    const survey = await Survey.findById(id)
      .populate('questions')
      .populate('surveyresponse');

    if (!survey) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Survey not found',
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: survey,
      message: 'Survey retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching survey by ID:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal server error',
    });
  }
});


/**
 * @swagger
 * /user-responses:
 *   post:
 *     summary: Get user responses by survey ID
 *     description: Retrieves responses for a particular user by the provided survey ID.You can get the survey ID and User ID from above API response.
 *     tags:
 *       - Response
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: User ID and survey ID required to fetch responses
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "66cf5e408781fb3bd6d84a6b"
 *               survey_id:
 *                 type: string
 *                 example: "66cf5d868781fb3bd6d84a58"
 *     responses:
 *       200:
 *         description: Successful retrieval of user responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Responses retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66cf5ed88781fb3bd6d84a7a"
 *                       survey_id:
 *                         type: string
 *                         example: "66cf5d868781fb3bd6d84a58"
 *                       user_id:
 *                         type: string
 *                         example: "66cf5e408781fb3bd6d84a6b"
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question_id:
 *                               type: string
 *                               example: "66cf5da58781fb3bd6d84a5c"
 *                             answer:
 *                               type: string
 *                               example: "Very satisfied"
 *                       status:
 *                         type: string
 *                         example: "Answered"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:31:17.971Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:31:17.971Z"
 *       400:
 *         description: Bad request (User ID and Survey ID are required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User ID and Survey ID are required in the request body
 *       404:
 *         description: No responses found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No responses found for the given user and survey
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */



app.post('/user-responses',apiKeyMiddleware, async (req, res) => {
  try {
    const { user_id, survey_id } = req.body;

    if (!user_id || !survey_id) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'User ID and Survey ID are required in the request body',
      });
    }

    const response = await responses.find({ user_id, survey_id });

    if (!responses.length) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'No responses found for the given user and survey',
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: response,
      message: 'Responses retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching user responses:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal server error',
    });
  }
});


/**
 * @swagger
 * /uploadlogo:
 *   post:
 *     summary: Upload a logo file
 *     description: Uploads a logo file and returns the file URL.
 *     tags:
 *       - Upload
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Upload a logo file
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: "https://your-s3-url.com/popcorn/uploaded-file.png"
 *                 message:
 *                   type: string
 *                   example: "File Upload Successfully"
 *       400:
 *         description: Bad request or file upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 *                 message:
 *                   type: string
 *                   example: "Failed,Try Again Later."
 */


app.post('/uploadlogo', apiKeyMiddleware,  aws_s3_upload.single("file"), async (req, res) => {
  try {
    const fileUrl = process.env.AWS_S3_VIEW_URL + "/popcorn/" + req.file.key;

    return res.status(200).json({
      status: 200,
      success: true,
      data: fileUrl,
      message: "File Upload Successfully",
    });
  } catch (error) {
    console.error("Error @ upload : ", error);
    return res.status(400).json({
      status: 400,
      success: false,
      error: error.message,
      message: "Failed,Try Again Later.",
    });
  }
});



/**
 * @swagger
 * /surveycreation:
 *   post:
 *     summary: Create a new survey
 *     description: This endpoint allows an admin to create a new survey with the required details.Get the logo from the upload api  response.
 *     tags:
 *       - Survey
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Survey details that need to be provided for creating a survey
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *                 description: URL of the survey logo
 *               title:
 *                 type: string
 *                 example: "Customer Satisfaction Survey"
 *                 description: Title of the survey
 *               description:
 *                 type: string
 *                 example: "This survey aims to gather customer feedback on our services."
 *                 description: Description of the survey
 *               category:
 *                 type: string
 *                 example: "Customer Feedback"
 *                 description: Category under which the survey falls
 *               createdby:
 *                 type: string
 *                 example: "Admin User"
 *                 description: Name of the person who created the survey
 *               reward_points:
 *                 type: integer
 *                 example: 100
 *                 description: Reward points for completing the survey
 *     responses:
 *       200:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 survey:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64cf5e408781fb3bd6d84a6b"
 *                     user_id:
 *                       type: string
 *                       example: "64cf5e408781fb3bd6d84a6b"
 *                     logo:
 *                       type: string
 *                       example: "https://example.com/logo.png"
 *                     title:
 *                       type: string
 *                       example: "Customer Satisfaction Survey"
 *                     description:
 *                       type: string
 *                       example: "This survey aims to gather customer feedback on our services."
 *                     category:
 *                       type: string
 *                       example: "Customer Feedback"
 *                     createdby:
 *                       type: string
 *                       example: "Admin User"
 *                     reward_points:
 *                       type: integer
 *                       example: 100
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-28T17:31:17.971Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-28T17:31:17.971Z"
 *                 message:
 *                   type: string
 *                   example: "Survey created successfully"
 *       400:
 *         description: Bad request due to missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "logo is required"
 *       500:
 *         description: Internal server error during survey creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create survey"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */


app.post('/surveycreation', apiKeyMiddleware, async (req, res) => {
  try {
    const { logo, title, description, category, createdby , reward_points } = req.body;
    if (!logo) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "logo is required",
      });
    }
    if (!title) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "title is required",
      });
    }
    if (!description) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "description is required",
      });
    }
    if (!category) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "category is required",
      });
    }

    if (!createdby) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "createdby is required",
      });
    }

    const newSurvey = new Survey({
      user_id: req.admin._id,
      logo,
      title,
      createdby,
      description,
      category,
      reward_points,
    });

    const savedSurvey = await newSurvey.save();

    return res.json({
      status: 200,
      success: true,
      survey: savedSurvey,
      message: "Survey created successfully",
    });
  } catch (error) {
    console.log("Error @ createSurvey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to create survey",
      error: error,
    });
  }
});


/**
 * @swagger
 * /createquestionforsurvey:
 *   post:
 *     summary: Create questions for a specific survey
 *     description: Adds multiple questions to a specified survey. Each question should be an object within an array provided in the request body.Get the survey id while creating survey api response.
 *     tags:
 *       - Survey
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Survey ID and questions to be added to the survey
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surveyId:
 *                 type: string
 *                 example: "64cf5e408781fb3bd6d84a6b"
 *                 description: ID of the survey to which questions will be added
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       example: "What is your favorite color?"
 *                       description: The text of the question
 *                     questionType:
 *                       type: string
 *                       example: "multiple-choice"
 *                       description: Type of the question (e.g., multiple-choice, text)
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Red", "Blue", "Green"]
 *                       description: Options available for multiple-choice questions
 *                 description: List of questions to be added
 *     responses:
 *       200:
 *         description: Questions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64cf5ed88781fb3bd6d84a7a"
 *                       survey:
 *                         type: string
 *                         example: "64cf5e408781fb3bd6d84a6b"
 *                       questionText:
 *                         type: string
 *                         example: "What is your favorite color?"
 *                       questionType:
 *                         type: string
 *                         example: "multiple-choice"
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Red", "Blue", "Green"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:31:17.971Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-28T17:31:17.971Z"
 *                 message:
 *                   type: string
 *                   example: "Questions created successfully"
 *       400:
 *         description: Bad request due to missing or incorrect fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "surveyId is required"
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Survey not found"
 *       500:
 *         description: Internal server error during question creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create questions"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */

app.post('/createquestionforsurvey', apiKeyMiddleware, async (req, res) => {
  try {
    const { surveyId, questions } = req.body;
    if (!surveyId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "surveyId is required",
      });
    }
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "questions is required and should be an array",
      });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Survey not found",
      });
    }

    const questionIds = [];
    const createdQuestions = [];
    for (const questionData of questions) {
      const newQuestion = new Question({
        ...questionData,
        survey: surveyId,
      });
      const savedQuestion = await newQuestion.save();
      questionIds.push(savedQuestion._id);
      createdQuestions.push(savedQuestion);
    }

    survey.questions = survey.questions.concat(questionIds);
    await survey.save();

    return res.json({
      status: 200,
      success: true,
      questions: createdQuestions,
      message: "Questions created successfully",
    });
  } catch (error) {
    console.log("Error @ createQuestion: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to create questions",
      error: error,
    });
  }
});




/**
 * @swagger
 * /savesurveylink:
 *   post:
 *     summary: Generate and save a survey link
 *     description: Generates a survey link for the provided survey ID and saves it to the survey document.Get the survey id while creating survey api response.
 *     tags:
 *       - Survey
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Survey ID required to generate and save the survey link
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surveyId:
 *                 type: string
 *                 example: "60d5f7d07c4a9d1e12f3a456"
 *     responses:
 *       200:
 *         description: Survey link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Survey link updated successfully
 *                 survey:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5f7d07c4a9d1e12f3a456"
 *                     title:
 *                       type: string
 *                       example: "Customer Satisfaction Survey"
 *                     description:
 *                       type: string
 *                       example: "A survey to gather customer feedback."
 *                     surveylink:
 *                       type: string
 *                       example: "https://event.mypopcorn.io/survey-details/60d5f7d07c4a9d1e12f3a456"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-29T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-29T10:00:00Z"
 *       400:
 *         description: Bad request (Survey ID is required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Survey ID is required
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Survey not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to update survey
 */

app.post('/savesurveylink', apiKeyMiddleware, async (req, res) => {
  try {
    const { surveyId } = req.body;

    if (!surveyId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Survey ID is required",
      });
    }

    const surveys = await Survey.findById(surveyId);
    if (!surveys) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Survey not found",
      });
    }

    const surveyLink = `https://event.mypopcorn.io/survey-details/${surveyId}`;

    surveys.surveylink = surveyLink;
    const updatedSurvey = await surveys.save();

    return res.json({
      status: 200,
      success: true,
      survey: updatedSurvey,
      message: "Survey link updated successfully",
    });
  } catch (error) {
    console.log("Error @ savelinkToSurvey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to update survey",
      error: error,
    });
  }
});


const PORT = process.env.PORT || 4225;

app.use(function (req, res, next) {
  const allowedOrigins = [
    process.env.FRONTEND_USER_DOMAIN,
    process.env.FRONTEND_ADMIN_DOMAIN,
    "http://localhost:4200",
    "http://localhost:4300",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", process.env.FRONTEND_DOMAIN);
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


app.use(errorHandler);
app.use(userRouter);
app.use(adminRouter);
app.use(siteSettingsRouter);
app.use(surveyrouter);



const socketserver = http.createServer(app);
const { startSocket } = require("./services/socket");
socketserver.listen(3003, () => {
  console.log("Web Socket Is Running On ", 3003);
});
startSocket(socketserver);


const server = app.listen(PORT, () => {
    console.log(`Server running in on port ${PORT}`);
  });
  
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err, promise) => {
    console.log(`unhandledRejection Error: ${err.message}`.red);
    // Close server & exit process
    // server.close(() => process.exit(1));
  });