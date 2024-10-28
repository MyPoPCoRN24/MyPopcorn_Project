const express = require("express");
const adminAuth = require("../middleware/auth-surveycreator");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/async");
const surveyController = require("../controllers/surveycreation");
const surveysController = new surveyController();
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const crypto = require("crypto");

const router = express.Router();

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

router.post(
  "/admin/kyc/upload",
  adminAuth,
  aws_s3_upload.single("file"),
  asyncHandler(surveysController.uploadFileAWSS3)
);

router.post(
  "/user/kyc/upload",
  auth,
  aws_s3_upload.single("file"),
  asyncHandler(surveysController.uploadFileAWSS3)
);

router.post(
  "/admin/creation",
  adminAuth,
  asyncHandler(surveysController.surveycreation)
);

router.post(
  "/admin/createQuestion",
  adminAuth,
  asyncHandler(surveysController.createQuestion)
);

router.post(
  "/admin/saveToSurvey",
  adminAuth,
  asyncHandler(surveysController.savelinkToSurvey)
);

router.patch(
  "/admin/editQuestion/:questionId",
  adminAuth,
  asyncHandler(surveysController.editQuestion)
);

router.delete(
  "/admin/deletequestion/:questionId",
  adminAuth,
  asyncHandler(surveysController.deleteQuestion)
);

router.get(
  "/admin/getallquestion/:surveyid",
  adminAuth,
  asyncHandler(surveysController.getQuestionsBySurveyId)
);

router.post(
  "/admin/getallsurvey",
  adminAuth,
  asyncHandler(surveysController.getAllSurvey)
);

router.post(
  "/user/getuserallsurvey",
  auth,
  asyncHandler(surveysController.getAlluserSurvey)
);

router.post(
  "/user/sumbit/:survey_id",
  auth,
  asyncHandler(surveysController.surveyresponse)
);

router.get(
  "/user/survey/:id",
  auth,
  asyncHandler(surveysController.getsurveyById)
);

router.get(
  "/admin/survey/:id",
  adminAuth,
  asyncHandler(surveysController.getsurveyById)
);

router.get(
  "/admin/surveyresponse/:surveyId/:userId",
  adminAuth,
  asyncHandler(surveysController.getadminResponseForSurvey)
);

router.get(
  "/user/surveyresponse/:surveyId",
  auth,
  asyncHandler(surveysController.getUserResponseForSurvey)
);

router.get(
  "/admin/responseanalyes/:surveyId",
  adminAuth,
  asyncHandler(surveysController.responseAnalyses)
);

router.post(
  "/admin/userlist",
  adminAuth,
  asyncHandler(surveysController.listUsersWithResponses)
);


router.get(
  "/download",
  asyncHandler(surveysController.download)
);


router.get(
  "/getasset/:assetID", adminAuth ,
  asyncHandler(surveysController.getasset)
);

router.get(
  "/admin/surveyactivity/:surveyId",
  adminAuth,
  asyncHandler(surveysController.activity)
);

router.get(
  "/user/surveyuseractivity/:surveyId",
  auth,
  asyncHandler(surveysController.useractivty)
);

router.get(
  "/admin/dashboard",
  adminAuth,
  asyncHandler(surveysController.getDashboardData)
);

router.post(
  "/admin/surveystatus/:id",
  adminAuth,
  asyncHandler(surveysController.surveystatus)
);

router.post(
  "/admin/getsurveybyuser/:surveyId",
  adminAuth,
  asyncHandler(surveysController.getsurveybyuser)
);

router.post(
  "/user/dashboard",
  auth,
  asyncHandler(surveysController.getuserDashboardData)
);

router.post(
  "/admin/questionswap",
  adminAuth,
  asyncHandler(surveysController.questionswap)
);


router.get(
  "/update",
  asyncHandler(surveysController.updateAllSurveysCreatedBy)
);

router.patch(
  "/admin/updateSurvey/:surveyId",
  adminAuth,
  asyncHandler(surveysController.updateSurvey)
);

router.patch(
  "/admin/updatesavelinkToSurvey",
  adminAuth,
  asyncHandler(surveysController.updatesavelinkToSurvey)
);


router.delete(
  "/admin/deleteSurvey/:id",
  adminAuth,
  asyncHandler(surveysController.deleteSurvey)
);


router.post(
  "/admin/swapSurveyPosition",
  adminAuth,
  asyncHandler(surveysController.swapSurveyPosition)
);

router.get(
  "/swap",
  asyncHandler(surveysController.swap)
);


router.get(
  "/question",
  asyncHandler(surveysController.question)
);

router.get(
  "/SurveySwap",
  asyncHandler(surveysController.SurveySwap)
);


router.get(
  "/dletesurvey",
  asyncHandler(surveysController.questiondelete)
);


router.post(
  "/admin/updatesavelinkToSurveyanddelete",
  adminAuth,
  asyncHandler(surveysController.updatesavelinkToSurveyanddelete)
);




module.exports = router;
