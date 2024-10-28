const Survey = require("../models/surveycreation");
const EmitData = require("../services/emitData");
const Notification = require("../models/notification");
const Responses = require("../models/responsemodel");
const Question = require("../models/question");
const User = require("../models/user");
const rewardmodel = require("../models/reward");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Bee } = require("@ethersphere/bee-js");
const bee = new Bee("https://swarm.mypopcorn.io");
const SurveySwarm = require("../models/swarmresponse");
const createAsset = require("../services/asset").createAsset;
const viewAsset = require("../services/asset").viewAsset;
const moment = require('moment-timezone'); 

let POSTAGE_BATCH_ID = null;
let tagUid = null;

async function generatePostageBatchId() {
  try {
    if (!POSTAGE_BATCH_ID) {
      const postageBatchId = await bee.createPostageBatch("414720000", 17);
      POSTAGE_BATCH_ID = postageBatchId;
      console.log("Generated new POSTAGE_BATCH_ID:", POSTAGE_BATCH_ID);
    }
  } catch (error) {
    console.error("Error generating POSTAGE_BATCH_ID:", error.message);
    throw new Error("Failed to generate POSTAGE_BATCH_ID");
  }
}

async function createTag() {
  try {
    if (!tagUid) {
      const response = await axios.post(
        "https://swarm.mypopcorn.io/tags",
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      tagUid = response.data.uid;
      console.log("Generated new Tag UID:", tagUid);
    }
  } catch (error) {
    console.error("Error creating tag:", error.message);
    throw new Error("Failed to create tag");
  }
}

async function uploadFileToSwarm(filePath) {
  try {
    await generatePostageBatchId();
    await createTag();

    const fileContent = fs.readFileSync(filePath);

    const result = await bee.uploadData(POSTAGE_BATCH_ID, fileContent);
    console.log("Uploaded file to Swarm with reference:", result.reference);

    return result.reference;
  } catch (error) {
    console.error("Error uploading file to Swarm:", error.message);
    throw new Error("Failed to upload file to Swarm");
  }
}

async function calculateOverallSurveyParticipations(allUsers, adminSurveyIds) {
  let overallSurveyParticipations = 0;

  for (const user of allUsers) {
    const responses = await Responses.find({ user_id: user._id }).lean();
    const filteredResponses = responses.filter((response) =>
      adminSurveyIds.includes(response.survey_id.toString())
    );

    const uniqueSurveyIds = new Set(
      filteredResponses.map((response) => response.survey_id.toString())
    );

    overallSurveyParticipations += uniqueSurveyIds.size;
  }

  return overallSurveyParticipations;
}
class surveyController {
  constructor() {}

  async surveycreation(req, res) {
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
  }

  async createQuestion(req, res) {
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
  }

  async savelinkToSurvey(req, res) {
    try {
      const { surveyId, surveylink } = req.body;
  
      if (!surveyId || !surveylink) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "surveyId and surveylink are required",
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
  
      // Find the highest surveySwap value for surveys created by the same user
      const maxSurveySwapSurvey = await Survey.findOne({ user_id: req.admin._id })
        .sort({ surveySwap: -1 })
        .select('surveySwap');
  
      // Set surveySwap to 1 if no previous surveys exist, otherwise increment the max value by 1
      const maxSurveySwap = maxSurveySwapSurvey && maxSurveySwapSurvey.surveySwap ? maxSurveySwapSurvey.surveySwap : 0;
      survey.surveySwap = maxSurveySwap + 1;
      survey.surveylink = surveylink;
  
      await survey.save();
  
      const admin = req.admin;
      await new Notification({
        user_id: admin._id,
        message: `${survey.title} created successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Survey created",
        logo: survey.logo,
        type: "",
      }).save();
  
      let data = await Notification.find({ user_id: admin._id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", admin._id, data);
  
      return res.json({
        status: 200,
        success: true,
        survey,
        message: "Survey created successfully",
      });
    } catch (error) {
      console.log("Error @ saveQuestionsToSurvey: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update survey",
        error: error,
      });
    }
  }
  
  
  

  async editQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const { surveyId, ...updateData } = req.body;

      if (!questionId || !surveyId) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "questionId and surveyId are required",
        });
      }

      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Question not found",
        });
      }

      if (question.survey.toString() !== surveyId) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Survey ID does not match the question's associated survey",
        });
      }

      for (let key in updateData) {
        question[key] = updateData[key];
      }

      const updatedQuestion = await question.save();

      return res.json({
        status: 200,
        success: true,
        question: updatedQuestion,
        message: "Question updated successfully",
      });
    } catch (error) {
      console.log("Error @ editQuestion: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to update question",
        error: error,
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { questionId } = req.params;

      if (!questionId) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "questionId is required",
        });
      }

      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Question not found",
        });
      }

      await Survey.updateOne(
        { _id: question.survey },
        { $pull: { questions: questionId } }
      );

      await Question.deleteOne({ _id: questionId });

      return res.json({
        status: 200,
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error) {
      console.log("Error @ deleteQuestion: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to delete question",
        error: error,
      });
    }
  }

  async getQuestionsBySurveyId(req, res) {
    try {
      const { surveyid } = req.params;

      const questions = await Question.find({ survey: surveyid });

      if (!questions.length) {
        return res.status(200).json({
          message: "No questions found for this survey",
          success: false,
          data: [],
        });
      }

      res.status(200).json({
        message: "Questions details fetched",
        success: true,
        data: questions,
      });
    } catch (error) {
      console.log("Error @ Get getQuestionsBySurveyId", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async surveyresponse(req, res) {
    try {
      const { answers } = req.body;
      const survey_id = req.params.survey_id;
      const user_id = req.user._id;
      const user = req.user;

      if (!survey_id) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Survey id is required",
        });
      }

      if (!answers || !answers.length) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Answers are required",
        });
      }

      for (const answer of answers) {
        if (
          !answer.question_id ||
          answer.answer === undefined ||
          answer.answer === null
        ) {
          return res.status(400).json({
            message: "Each answer must include question_id and answer",
          });
        }
      }

      const existingResponse = await Responses.findOne({ survey_id, user_id });
      if (existingResponse) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Already submitted a response for this survey",
        });
      }

      const survey = await Survey.findById(survey_id).populate(
        "questions user_id"
      );
      const answeredQuestionIds = answers.map((answer) =>
        answer.question_id.toString()
      );
      const allQuestionsAnswered = survey.questions.every((question) =>
        answeredQuestionIds.includes(question._id.toString())
      );

      const newResponse = new Responses({
        survey_id,
        user_id,
        answers,
        status: allQuestionsAnswered ? "Answered" : "Partially answered",
      });

      const filePath = path.join(__dirname, `${survey_id}_responses.json`);

      let surveyData = {
        survey_id: survey._id,
        survey_creator: survey.user_id.address,
        survey_logo: survey.logo,
        survey_title: survey.title,
        survey_description: survey.description,
        survey_category: survey.category,
        survey_surveylink: survey.surveylink,
        survey_reward_points: survey.reward_points,
        response: [],
      };

      if (fs.existsSync(filePath)) {
        surveyData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }

      const newResponseData = {
        res_user_address: user.address,
        res_status: newResponse.status,
        res_reward_points: allQuestionsAnswered ? survey.reward_points : 0,
      };

      surveyData.response.push(newResponseData);

      fs.writeFileSync(filePath, JSON.stringify(surveyData, null, 2));

      let swarmReference;
      try {
        swarmReference = await uploadFileToSwarm(filePath);
      } catch (err) {
        console.error("Error uploading file to Swarm:", err);
        surveyData.response.pop();
        fs.writeFileSync(filePath, JSON.stringify(surveyData, null, 2));
        return res
          .status(500)
          .json({ message: "Failed to upload file to Swarm" });
      }

      try {
        const URI = `http://localhost:4225/download?reference=${swarmReference}`;
        await createAsset(
          "0x68BE6C099055dd594cB1A3b3DA79aa2e7af2e987",
          parseInt(survey._id.toString().substring(0, 4), 16),
          survey.title,
          URI,
          "0x9411044f11821e0cecc253a4fdd9450313a50c29368e2ee25e82f77703a9f06b"
        );
      } catch (error) {
        console.error("Error creating asset on blockchain:", error);
        surveyData.response.pop();
        fs.writeFileSync(filePath, JSON.stringify(surveyData, null, 2));
        return res
          .status(500)
          .json({ message: "Failed to create asset on blockchain" });
      }

      const savedResponse = await newResponse.save();

      await Survey.findByIdAndUpdate(
        survey_id,
        { $push: { surveyresponse: savedResponse._id } },
        { new: true }
      );

      const existingSurveySwarm = await SurveySwarm.findOne({ survey_id });

      if (existingSurveySwarm) {
        existingSurveySwarm.swarm_reference = swarmReference;
        await existingSurveySwarm.save();
      } else {
        await new SurveySwarm({
          survey_creator: survey.user_id.address,
          survey_id: survey._id,
          swarm_reference: swarmReference,
          asset_id: parseInt(survey._id.toString().substring(0, 4), 16),
        }).save();
      }

      await new Notification({
        user_id: user_id,
        message: `Response submitted successfully - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Response Submission",
        logo: survey.logo,
        type: "",
      }).save();

      let data = await Notification.find({ user_id: user_id, read: false })
        .sort({ createdAt: -1 })
        .limit(5);

      EmitData.sendData("new_notification", user_id, data);

      await new Notification({
        user_id: survey.user_id,
        message: `${survey.title} received a new response from ${
          user.name
        } - IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`,
        title: "Response Submission",
        logo: survey.logo,
        type: "",
      }).save();

      let datas = await Notification.find({
        user_id: survey.user_id,
        read: false,
      })
        .sort({ createdAt: -1 })
        .limit(5);
      EmitData.sendData("new_notification", survey.user_id, datas);

      return res.json({
        status: 200,
        success: true,
        response: savedResponse,
        message: "Response submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async download(req, res) {
    const { reference } = req.query;
    const downloadPath = path.join(__dirname, "downloads", `${reference}.json`);

    if (!reference) {
      return res.status(400).json({
        message: "Reference is required to download files.",
      });
    }

    try {
      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
        console.log("Existing file deleted:", downloadPath);
      }

      if (!fs.existsSync(path.dirname(downloadPath))) {
        fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
      }

      const retrievedData = await bee.downloadData(reference);
      fs.writeFileSync(downloadPath, retrievedData);

      console.log("File downloaded successfully:", downloadPath);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reference}.json"`
      );
      res.setHeader("Content-Type", "application/json");
      res.sendFile(downloadPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Failed to send file");
        } else {
          console.log("File sent successfully");
        }
      });
    } catch (error) {
      console.error("Error downloading file from Swarm:", error.message);
      res.status(500).json({ message: "Failed to download file from Swarm" });
    }
  }

  async getasset(req, res) {
    const { assetID } = req.params;

    try {
      const assetDetails = await viewAsset(assetID);
      res.json({
        success: true,
        data: assetDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch asset details",
      });
    }
  }

  async uploadFileAWSS3(req, res) {
    try {
      let output1 = process.env.AWS_S3_VIEW_URL + "/popcorn/" + req.file.key;
      return res.status(200).send({
        status: 200,
        success: true,
        data: output1,
        message: "File Upload Successfully",
      });
    } catch (error) {
      console.log("Error @ upload : ", error);
      return res.status(400).send({
        status: 400,
        success: false,
        error: error,
        message: "Failed,Try Again Later.",
      });
    }
  }

  async getAllSurvey(req, res) {
    try {
      let page = req.body.page || 1;
      let limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
  
      const searchCriteria = {
        user_id: req.admin._id,
        questions: { $ne: [] },
        surveylink: { $exists: true, $ne: "" },
      };
  
      if (typeof req.body.status === "boolean") {
        searchCriteria.status = req.body.status;
      }
  
      const totalSurveyCount = await Survey.countDocuments({
        ...searchCriteria,
        status: true,
      });
  
      const totalResponsesOverall = await Responses.countDocuments({
        survey_id: { $in: await Survey.find(searchCriteria).distinct("_id") },
      });
  
      const surveys = await Survey.find({
        ...searchCriteria,
        ...(req.body.key
          ? {
              $or: [
                {
                  title: {
                    $regex: new RegExp(req.body.key, "i"),
                  },
                },
              ],
            }
          : {}),
      })
      .sort({ surveySwap: -1 })
        .skip(skip)
        .limit(limit)
        .populate("questions surveyresponse");
  
      if (!surveys) {
        return res
          .status(400)
          .json({ message: "Something went wrong", success: false });
      }
  
      const surveyIds = surveys.map((survey) => survey._id);
  
      const responses = await Responses.aggregate([
        { $match: { survey_id: { $in: surveyIds } } },
        {
          $group: {
            _id: "$survey_id",
            totalResponses: { $sum: 1 },
            responsesLast24Hours: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);
  
      const responseMap = responses.reduce((acc, response) => {
        acc[response._id] = response;
        return acc;
      }, {});
  
      const surveyData = surveys.map((survey) => {
        const response = responseMap[survey._id] || {
          totalResponses: 0,
          responsesLast24Hours: 0,
        };
        return {
          ...survey._doc,
          totalResponses: response.totalResponses,
          responsesLast24Hours: response.responsesLast24Hours,
        };
      });
  
      const count = await Survey.countDocuments({
        ...searchCriteria,
        ...(req.body.key
          ? {
              $or: [
                {
                  title: {
                    $regex: new RegExp(req.body.key, "i"),
                  },
                },
              ],
            }
          : {}),
      });
  
      const rewardData = await rewardmodel.aggregate([
        { $match: { isclaimed: true } },
        {
          $group: {
            _id: null,
            totalRewardPoints: {
              $sum: {
                $toDouble: "$reward_points",
              },
            },
          },
        },
      ]);
  
      const totalRewardPoints =
        rewardData.length > 0 ? rewardData[0].totalRewardPoints : 0;
  
      return res.status(200).json({
        message: "Successfully fetched",
        success: true,
        count: count,
        totalSurveyCount: totalSurveyCount,
        data: surveyData,
        totalResponsesOverall: totalResponsesOverall,
        totalRewardPoints,
      });
    } catch (error) {
      console.log("Error @ getAllSurvey", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
  
  
  

  async surveystatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const survey = await Survey.findById(id);
      if (!survey) {
        return res
          .status(404)
          .json({ success: false, message: "Survey not found" });
      }

      survey.status = status;
      await survey.save();

      return res.status(200).json({
        success: true,
        message: `Survey updated as  ${
          survey.status === true ? "Active" : "Inactive"
        }`,
        status: 200,
      });
    } catch (error) {
      console.error("Error @ toggleSurveyStatus:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getAlluserSurvey(req, res) {
    try {
      let page = req.body.page || 1;
      let limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
      const user_id = req.user._id;
  
      // Search criteria
      const search = {
        $or: [
          {
            status: true,
            questions: { $ne: [] },
            surveylink: { $exists: true, $ne: "" },
          },
          {
            _id: { $in: await Responses.distinct("survey_id", { user_id: user_id }) }
          }
        ],
        ...(req.body.key
          ? {
              title: {
                $regex: new RegExp(req.body.key, "i"),
              },
            }
          : {}),
      };
  
      // Fetch surveys without pagination for counting
      let allSurveys = await Survey.find(search).populate("questions").sort({ surveySwap: -1 })
  
      const userResponses = await Responses.find({ user_id: user_id });
      
      const responseMap = new Map();
      userResponses.forEach((response) => {
        responseMap.set(response.survey_id.toString(), response);
      });
  
      const surveyResponseCounts = await Responses.aggregate([
        { $match: { survey_id: { $in: allSurveys.map((s) => s._id) } } },
        { $group: { _id: "$survey_id", count: { $sum: 1 } } },
      ]);
  
      const responseCountMap = new Map();
      surveyResponseCounts.forEach((item) => {
        responseCountMap.set(item._id.toString(), item.count);
      });
  
      let enhancedSurveyList = allSurveys.map((survey) => {
        const response = responseMap.get(survey._id.toString());
        const userStatus = response ? "Responded" : "Assigned";
        const totalResponses = responseCountMap.get(survey._id.toString()) || 0;
  
        return {
          ...survey.toObject(),
          userStatus,
          totalResponses,
        };
      });
  
      // Filter based on user status ("Assigned" or "Responded") if provided
      if (req.body.status) {
        enhancedSurveyList = enhancedSurveyList.filter(
          (survey) => survey.userStatus === req.body.status
        );
      }
  
      // Update count after filtering
      const filteredCount = enhancedSurveyList.length;
  
      // Apply pagination after filtering
      const paginatedSurveys = enhancedSurveyList.slice(skip, skip + limit);
  
      const user = await User.findById(
        user_id,
        "reward_points claimed_reward_points"
      );
  
      return res.status(200).json({
        message: "Successfully fetched",
        success: true,
        count: filteredCount,
        data: paginatedSurveys,
        totalRewardClaimed: user.claimed_reward_points,
        rewards: user.reward_points,
        totalSurveysResponded: userResponses.length,
      });
    } catch (error) {
      console.log("Error @ getAllsurvey ", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
  
  
  
  

  async getsurveyById(req, res) {
    try {
      const getsurveyById = await Survey.findById(req.params.id).populate(
        "questions"
      );

      res.status(200).json({
        message: "survey Details fetched",
        success: true,
        data: getsurveyById,
      });
    } catch (error) {
      console.log("Error @ Get getsurveyById", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async getadminResponseForSurvey(req, res) {
    try {
      const { surveyId, userId } = req.params;

      const response = await Responses.findOne({
        survey_id: surveyId,
        user_id: userId,
      })
        .populate("survey_id")
        .populate("user_id", "-password -secret2FA -privatekey") 
        .populate("answers.question_id");

      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      res.status(200).json({
        message: "Response details fetched",
        success: true,
        data: response,
      });
    } catch (error) {
      console.log("Error @ getUserResponseForSurvey", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async getUserResponseForSurvey(req, res) {
    try {
      const { surveyId } = req.params;
      const userId = req.user._id;

      const response = await Responses.findOne({
        survey_id: surveyId,
        user_id: userId,
      })
        .populate("survey_id")
        .populate("user_id", "-password -secret2FA -privatekey") // Exclude sensitive fields
        .populate("answers.question_id");

      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      res.status(200).json({
        message: "Response details fetched",
        success: true,
        data: response,
      });
    } catch (error) {
      console.log("Error @ getUserResponseForSurvey", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async responseAnalyses(req, res) {
    try {
      const surveyId = req.params.surveyId;

      const responses = await Responses.find({ survey_id: surveyId })
        .populate({
          path: "answers.question_id",
          model: "Question",
        })
        .populate({
          path: "user_id",
          model: "User",
          select: "-password -secret2FA -privatekey", 
        })
        .populate({
          path: "survey_id",
          model: "Survey",
        });

      if (!responses.length) {
        return res.status(404).json({
          message: "No responses found for this survey",
          success: false,
        });
      }

      const result = {
        surveyId: responses[0].survey_id,
        responses: [],
        questionsSummary: [],
      };

      const questionsMap = {};

      responses.forEach((response) => {
        const userResponse = {
          user: response.user_id,
          answers: [],
        };

        response.answers.forEach((answer) => {
          const question = answer.question_id;
          const answerText = answer.answer;

          userResponse.answers.push({
            question: question,
            answer: answerText,
          });

          if (!questionsMap[question._id]) {
            questionsMap[question._id] = {
              question: question,
              totalResponses: 0,
              options: {},
              answers: [],
            };
          }

          questionsMap[question._id].totalResponses += 1;

          if (question.questionType === "multiple_choice") {
            if (!questionsMap[question._id].options[answerText]) {
              questionsMap[question._id].options[answerText] = {
                count: 0,
                users: [],
              };
            }
            questionsMap[question._id].options[answerText].count += 1;
            questionsMap[question._id].options[answerText].users.push(
              response.user_id
            );
          } else if (question.questionType === "text") {
            questionsMap[question._id].answers.push({
              user: response.user_id,
              answer: answerText,
            });
          }
        });

        result.responses.push(userResponse);
      });

      Object.keys(questionsMap).forEach((questionId) => {
        const questionData = questionsMap[questionId];
        const questionSummary = {
          question: questionData.question,
          totalResponses: questionData.totalResponses,
        };

        if (questionData.question.questionType === "multiple_choice") {
          questionSummary.options = questionData.question.options.map(
            (option) => {
              const optionData = questionData.options[option] || {
                count: 0,
                users: [],
              };
              const percentage =
                (optionData.count / questionData.totalResponses) * 100;
              return {
                option,
                percentage,
                userCount: optionData.count,
                users: optionData.users,
              };
            }
          );
        } else if (questionData.question.questionType === "text") {
          questionSummary.answers = questionData.answers;
        }

        result.questionsSummary.push(questionSummary);
      });

      return res.status(200).json({
        message: "Responses fetched successfully",
        success: true,
        data: result,
      });
    } catch (error) {
      console.log("Error @ responseAnalyses ", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async listUsersWithResponses(req, res) {
    try {
      let page = req.body.page || 1;
      let limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
      const sortOption = req.body.sortOption || null; 
      const search = req.body.key
        ? {
            $or: [
              { name: { $regex: new RegExp(req.body.key, "i") } },
              { address: { $regex: new RegExp(req.body.key, "i") } },
            ],
          }
        : {};
  
      const allUsers = await User.find({})
        .select("_id name address email status createdAt")
        .lean();
  
      const adminSurveys = await Survey.find({ user_id: req.admin._id })
        .select("_id")
        .lean();
      const adminSurveyIds = adminSurveys.map((survey) =>
        survey._id.toString()
      );
  
      const overallSurveyParticipations = await calculateOverallSurveyParticipations(allUsers, adminSurveyIds);
  
      // Fetch and sort users by `createdAt` in descending order
      const filteredUsers = await User.find(search)
        .select("_id name address email status createdAt")
        .sort({ createdAt: -1 })  // Sort by `createdAt` in descending order
        .lean();
  
      const userPromises = filteredUsers.map(async (user) => {
        const responses = await Responses.find({ user_id: user._id }).lean();
        const filteredResponses = responses.filter((response) =>
          adminSurveyIds.includes(response.survey_id.toString())
        );
  
        const uniqueSurveyIds = [
          ...new Set(
            filteredResponses.map((response) => response.survey_id.toString())
          ),
        ];
  
        const surveyTitles = await Survey.find({
          _id: { $in: uniqueSurveyIds },
        })
          .select("_id title")
          .lean();
        const surveyTitleMap = surveyTitles.reduce((acc, survey) => {
          acc[survey._id.toString()] = survey.title;
          return acc;
        }, {});
  
        return {
          ...user,
          totalResponses: filteredResponses.length,
          uniqueSurveyIds: uniqueSurveyIds.map((id) => ({
            _id: id,
            title: surveyTitleMap[id] || "Unknown",
          })),
        };
      });
  
      let usersWithResponses = await Promise.all(userPromises);
  
      if (sortOption === 'asc') {
        usersWithResponses = usersWithResponses.sort((a, b) => a.totalResponses - b.totalResponses);
      } else if (sortOption === 'desc') {
        usersWithResponses = usersWithResponses.sort((a, b) => b.totalResponses - a.totalResponses);
      }
  
      // Slice the sorted and processed users to apply pagination
      const paginatedUsers = usersWithResponses.slice(skip, skip + limit);
  
      const count = usersWithResponses.length;
      const totalusersCount = await User.countDocuments({});
  
      return res.status(200).json({
        message: "Users fetched successfully",
        success: true,
        count,
        data: paginatedUsers,
        overallSurveyParticipations, 
        totalusersCount,
      });
    } catch (error) {
      console.error("Error @ listUsersWithResponses", error.message);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
  
  
 
  
  
  
  

  async activity(req, res) {
    try {
      const { surveyId } = req.params;

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      const totalResponses = await Responses.countDocuments({
        survey_id: surveyId,
      });
      const totalUserCount = await User.countDocuments();

      const distinctUserIds = await Responses.distinct("user_id", {
        survey_id: surveyId,
      });
      const responseGivenUserCount = distinctUserIds.length;

      const graphData = (responseGivenUserCount / totalUserCount) * 100;

      const answeredResponsesCount = await Responses.countDocuments({
        survey_id: surveyId,
        status: "Answered",
      });

      const rewardPointsForSurvey = survey.reward_points;
      const totalRewardPoints = answeredResponsesCount * rewardPointsForSurvey;

      return res.status(200).json({
        success: true,
        message: "Successfully fetched survey response stats",
        totalResponses: totalResponses,
        rewardpoints: totalRewardPoints,
        surveystatus: survey.status,
        surveylink: survey.surveylink,
        createdby:survey.createdby,
        category:survey.category,
        graphData: graphData,
        surveyCreatedAt: survey.createdAt,
      });
    } catch (error) {
      console.log("Error @ response-stats", error.message);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async useractivty(req, res) {
    try {
      const { surveyId } = req.params;

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      const totalResponses = await Responses.countDocuments({
        survey_id: surveyId,
      });
      const totalUserCount = await User.countDocuments();

      const distinctUserIds = await Responses.distinct("user_id", {
        survey_id: surveyId,
      });
      const responseGivenUserCount = distinctUserIds.length;

      const graphData = (responseGivenUserCount / totalUserCount) * 100;

      return res.status(200).json({
        success: true,
        message: "Successfully fetched survey response stats",
        totalResponses: totalResponses,
        rewardpoints: survey.reward_points,
        surveystatus: survey.status,
        graphData: graphData,
        createdby:survey.createdby,
        category:survey.category,
        rewardpoint: survey.reward_points,
        surveyCreatedAt: survey.createdAt,
      });
    } catch (error) {
      console.log("Error @ response-stats", error.message);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDashboardData(req, res) {
    try {
      const adminId = req.admin._id;
      const daysRange = parseInt(req.body.daysRange) || 7;
  
      if (isNaN(daysRange) || daysRange < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid days range provided",
        });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      let startDate;
      if (daysRange === 0) {
        startDate = today;
      } else {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - (daysRange - 1));
      }
  
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 1);
  
      const startOf24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
      const userActivity = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
            newUsers: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.day",
            newUsers: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);
  
      const datesArray = [];
      if (daysRange > 0) {
        for (let i = 0; i < daysRange; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          datesArray.push(date.toISOString().split("T")[0]);
        }
      } else {
        datesArray.push(startDate.toISOString().split("T")[0]);
      }
  
      const dailyUserActivity = await Promise.all(
        datesArray.map(async (date) => {
          const activity = userActivity.find((u) => u.date === date);
          const newUsers = activity ? activity.newUsers : 0;
          const totalUsersTillDate = await User.countDocuments({
            createdAt: { $lte: new Date(date + "T23:59:59Z") },
          });
          const oldUsers = totalUsersTillDate - newUsers;
  
          const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          });
  
          return {
            date: dayOfWeek,
            newUsers,
            oldUsers,
          };
        })
      );
  
      const totalUsers = await User.countDocuments();
  
      const surveyResponses = await Survey.aggregate([
        {
          $match: {
            user_id: adminId,
            questions: { $ne: [] },
            surveylink: { $exists: true, $ne: "" },
          },
        },
        {
          $lookup: {
            from: "responses",
            localField: "_id",
            foreignField: "survey_id",
            as: "responses",
          },
        },
        {
          $addFields: {
            totalResponses: { $size: "$responses" },
            recentResponses: {
              $size: {
                $filter: {
                  input: "$responses",
                  as: "response",
                  cond: { $gte: ["$$response.createdAt", startOf24Hours] },
                },
              },
            },
          },
        },
        { $sort: { totalResponses: -1 } },
        { $limit: 3 },
      ]);
  
      const totalSurveys = await Survey.countDocuments({
        user_id: adminId,
        questions: { $ne: [] },
        surveylink: { $exists: true, $ne: "" },
      });
  
      let recentSurveysData = await Survey.aggregate([
        {
          $match: {
            user_id: adminId,
            questions: { $ne: [] },
            surveylink: { $exists: true, $ne: "" },
          },
        },
        { $sort: { surveySwap: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "responses",
            localField: "_id",
            foreignField: "survey_id",
            as: "responses",
          },
        },
        {
          $addFields: {
            totalResponses: { $size: "$responses" },
            recentResponses: {
              $size: {
                $filter: {
                  input: "$responses",
                  as: "response",
                  cond: { $gte: ["$$response.createdAt", startOf24Hours] },
                },
              },
            },
          },
        },
      ]);
  
      recentSurveysData = await Survey.populate(recentSurveysData, {
        path: "questions",
        select: "survey questionText questionType options", 
      });
  
      const rewardData = await rewardmodel.aggregate([
        { $match: { isclaimed: true } },
        {
          $group: {
            _id: null,
            totalRewardPoints: {
              $sum: {
                $toDouble: "$reward_points",
              },
            },
          },
        },
      ]);
  
      const totalRewardPoints =
        rewardData.length > 0 ? rewardData[0].totalRewardPoints : 0;
  
      res.status(200).json({
        success: true,
        message: "Successfully fetched survey response stats",
        data: {
          dailyUserActivity,
          totalUsers,
          totalSurveys,
          surveyResponses,
          recentSurveys: recentSurveysData,
          totalRewardPoints,
        },
      });
    } catch (error) {
      console.error("Error @ getDashboardData: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard data",
        error,
      });
    }
  }
  

  async getsurveybyuser(req, res) {
    try {
      const { surveyId } = req.params;
      const limit = parseInt(req.body.limit);
      const page = parseInt(req.body.page);
      const skip = (page - 1) * limit;

      const responses = await Responses.find({ survey_id: surveyId })
        .populate("user_id survey_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const result = responses.map((response) => ({
        name: response.user_id.name,
        address: response.user_id.address,
        userid: response.user_id._id,
        rewardpoints: response.survey_id.reward_points,
        status: response.status,
      }));

      const totalCount = await Responses.countDocuments({
        survey_id: surveyId,
      });

      res.status(200).json({
        success: true,
        message: "Successfully fetched survey response stats",
        data: result,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error @ getsurveybyuser: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch survey response stats",
        error,
      });
    }
  }

  async getuserDashboardData(req, res) {
    try {
      const userId = req.user._id;
      const timezone = req.body.timezone || 'UTC'; // Default to UTC if timezone is not provided
  
      const surveyAssignedCount = await Survey.countDocuments({
        $or: [
          {
            status: true,
            questions: { $exists: true, $ne: [] },
            surveylink: { $exists: true, $ne: "" },
          },
          {
            _id: { $in: await Responses.distinct("survey_id", { user_id: userId }) }
          }
        ],
      });
  
      const surveyParticipatedCount = await Responses.countDocuments({
        user_id: userId,
      });
  
      const recentSurveys = await Survey.find({
        $or: [
          {
            status: true,
            questions: { $exists: true, $ne: [] },
            surveylink: { $exists: true, $ne: "" },
          },
          {
            _id: { $in: await Responses.distinct("survey_id", { user_id: userId }) }
          }
        ],
      })
        .sort({ surveySwap: -1 })
        .limit(3)
        .lean();
  
      const surveyWithStatus = await Promise.all(
        recentSurveys.map(async (survey) => {
          const userResponse = await Responses.findOne({
            survey_id: survey._id,
            user_id: userId,
          });
  
          const totalResponses = await Responses.countDocuments({
            survey_id: survey._id,
          });
  
          return {
            ...survey,
            userStatus: userResponse ? "Responded" : "Assigned",
            totalResponses: totalResponses,
          };
        })
      );
  
      const { days } = req.body;
      const dateFrom = moment().tz(timezone).subtract(days, 'days').startOf('day').toDate();
  
      const completeDatesList = [];
      for (let i = 0; i < days; i++) {
        const currentDate = moment().tz(timezone).subtract(i, 'days').startOf('day');
        completeDatesList.push({
          date: currentDate.format("YYYY-MM-DD"),
          dailyRewardPoints: 0,
        });
      }
      completeDatesList.reverse();
  
      const rewardHistory = await Responses.aggregate([
        {
          $match: {
            user_id: userId,
            status: "Answered",
            createdAt: { $gte: dateFrom },
          },
        },
        {
          $lookup: {
            from: "surveys",
            localField: "survey_id",
            foreignField: "_id",
            as: "survey",
          },
        },
        { $unwind: "$survey" },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: { $add: ["$createdAt", moment().tz(timezone).utcOffset() * 60 * 1000] } },
              },
            },
            dailyRewardPoints: { $sum: "$survey.reward_points" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            dailyRewardPoints: 1,
          },
        },
      ]);
  
      completeDatesList.forEach((dateObj) => {
        const dateReward = rewardHistory.find(
          (item) => item.date === dateObj.date
        );
        if (dateReward) {
          dateObj.dailyRewardPoints = dateReward.dailyRewardPoints;
        }
      });
  
      const totalRewards = completeDatesList.reduce(
        (acc, item) => acc + item.dailyRewardPoints,
        0
      );
  
      res.json({
        message: "Successfully fetched",
        success: true,
        surveyAssignedCount,
        surveyParticipatedCount,
        recentSurveys: surveyWithStatus,
        totalRewards,
        rewardHistory: completeDatesList,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch dashboard data", success: false });
    }
  }
  
  
  


  async questionswap(req, res) {
    try {
      const { surveyId, questionId, direction } = req.body;
  
      const survey = await Survey.findById(surveyId).populate('questions');
  
      if (!survey) {
        return res.status(404).json({ message: 'Survey not found' });
      }
  
      const questionIndex = survey.questions.findIndex(
        (question) => question._id.toString() === questionId
      );
  
      if (questionIndex === -1) {
        return res.status(404).json({ message: 'Question not found in the survey' });
      }
  
      let newIndex;
      if (direction === 'up') {
        newIndex = questionIndex === 0 ? survey.questions.length - 1 : questionIndex - 1;
      } else if (direction === 'down') {
        newIndex = questionIndex === survey.questions.length - 1 ? 0 : questionIndex + 1;
      } else {
        return res.status(400).json({ message: 'Invalid direction' });
      }
  
      // Swap the questions
      const question1 = await Question.findById(survey.questions[questionIndex]._id);
      const question2 = await Question.findById(survey.questions[newIndex]._id);
  
      if (!question1 || !question2) {
        return res.status(404).json({ message: 'One or both questions not found' });
      }
  
      const temp = {
        questionText: question1.questionText,
        questionType: question1.questionType,
        options: question1.options
      };
  
      question1.questionText = question2.questionText;
      question1.questionType = question2.questionType;
      question1.options = question2.options;
  
      question2.questionText = temp.questionText;
      question2.questionType = temp.questionType;
      question2.options = temp.options;
  
      await question1.save();
      await question2.save();
  
      res.status(200).json({ message: 'Questions swapped successfully', survey });
    } catch (error) {
      console.error('Error in questionswap:', error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  }
  
  async updateAllSurveysCreatedBy (req, res)  {
    try {
        let surveys = await Survey.find({ createdby: { $exists: false } });

        if (surveys.length > 0) {
            for (let survey of surveys) {
                survey.createdby = 'Admin'; 
                await survey.save(); 
            }
        }

        return res.status(200).json({
            message: 'Surveys updated successfully',
            updatedCount: surveys.length
        });
    } catch (error) {
        return res.status(500).json({
            message: 'An error occurred while updating the surveys',
            error: error.message
        });
    }
};
  

async updateSurvey(req, res) {
  try {
    const { surveyId } = req.params;
    const { logo, title, description, category, createdby, reward_points } =
      req.body;
    if (!surveyId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "surveyId is required",
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
    if (logo !== undefined) survey.logo = logo;
    if (title !== undefined) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (category !== undefined) survey.category = category;
    if (createdby !== undefined) survey.createdby = createdby;
    if (reward_points !== undefined) survey.reward_points = reward_points;
    const updatedSurvey = await survey.save();
    return res.json({
      status: 200,
      success: true,
      survey: updatedSurvey,
      message: "Survey updated successfully",
    });
  } catch (error) {
    console.log("Error @ updateSurvey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to update survey",
      error: error.message,
    });
  }
}

async updatesavelinkToSurvey(req, res) {
  try {
    const { surveyId, surveylink } = req.body;
    if (!surveyId || !surveylink) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "surveyId and surveylink are required",
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
    survey.surveylink = surveylink;
    await survey.save();
    const admin = req.admin;
    await new Notification({
      user_id: admin._id,
      message: `${survey.title} updated successfully - IP: ${
        req.headers["x-forwarded-for"] || req.connection.remoteAddress
      }`,
      title: "Survey updated",
      logo: survey.logo,
      type: "",
    }).save();
    let data = await Notification.find({ user_id: admin._id, read: false })
      .sort({ createdAt: -1 })
      .limit(5);
    EmitData.sendData("new_notification", admin._id, data);
    return res.json({
      status: 200,
      success: true,
      survey,
      message: "Survey updated successfully",
    });
  } catch (error) {
    console.log("Error @ saveQuestionsToSurvey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to update survey",
      error: error,
    });
  }
}


async deleteSurvey(req, res) {
  try {
    const surveyId = req.params.id;

    const surveyToDelete = await Survey.findById(surveyId);
    if (!surveyToDelete) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const userSurveys = await Survey.find({ user_id: surveyToDelete.user_id }).sort({ surveySwap: 1 });

    const remainingSurveys = userSurveys
      .filter(survey => survey._id.toString() !== surveyId)
      .filter(survey => survey.surveylink && survey.surveylink !== "" && survey.questions && survey.questions.length > 0);

    for (let i = 0; i < remainingSurveys.length; i++) {
      remainingSurveys[i].surveySwap = i + 1;
      await remainingSurveys[i].save();
    }

    await Responses.deleteMany({ survey_id: surveyId });
    await Question.deleteMany({ survey: surveyId });

    await Survey.findByIdAndDelete(surveyId);

    res.status(200).json({ message: 'Survey and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}




async swapSurveyPosition(req, res) {
  try {
    const { surveyId, direction } = req.body;

    if (!surveyId || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid surveyId or direction. Direction must be 'up' or 'down'.",
      });
    }

    const currentSurvey = await Survey.findById(surveyId);
    if (!currentSurvey) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Survey not found",
      });
    }

    // Find the adjacent survey based on direction
    let adjacentSurveyCondition = {};
    if (direction === 'up') {
      adjacentSurveyCondition = { surveySwap: currentSurvey.surveySwap - 1 };
    } else if (direction === 'down') {
      adjacentSurveyCondition = { surveySwap: currentSurvey.surveySwap + 1 };
    }

    // Find adjacent survey
    const adjacentSurvey = await Survey.findOne(adjacentSurveyCondition);
    
    if (!adjacentSurvey) {
      // No adjacent survey with surveySwap, find closest one in direction
      const directionSort = direction === 'up' ? -1 : 1;
      const adjacentSurveyFallback = await Survey.findOne({
        surveySwap: { $exists: true }
      }).sort({ surveySwap: directionSort });
      
      if (!adjacentSurveyFallback) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Cannot swap. No adjacent survey found in the specified direction.",
        });
      }

      // Use fallback survey for swapping
      adjacentSurveyCondition = { _id: adjacentSurveyFallback._id };
    }

    const adjacentSurveyFinal = await Survey.findOne(adjacentSurveyCondition);
    if (!adjacentSurveyFinal) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Cannot swap. No adjacent survey found.",
      });
    }

    // Perform the swap
    const tempSwapValue = currentSurvey.surveySwap;
    currentSurvey.surveySwap = adjacentSurveyFinal.surveySwap;
    adjacentSurveyFinal.surveySwap = tempSwapValue;

    await currentSurvey.save();
    await adjacentSurveyFinal.save();

    return res.json({
      status: 200,
      success: true,
      message: "Survey positions swapped successfully",
      currentSurvey,
      adjacentSurvey: adjacentSurveyFinal,
    });

  } catch (error) {
    console.error("Error @ swapSurveyPosition: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to swap surveys",
      error: error.message,
    });
  }
}





async swap(req, res) {
  try {
    const surveys = await Survey.find();

   

    res.json({ surveys });
  } catch (error) {
    console.error('Error updating surveys:', error);
    res.status(500).json({ error: 'An error occurred while updating surveys.' });
  }
};


async SurveySwap(req, res){
  try {
    const surveys = await Survey.find({
      surveylink: { $exists: true, $ne: "" }, 
      questions: { $exists: true, $ne: [] }  
    });

    let count = 0; 
    let surveySwapValue = 1; 

    for (let survey of surveys) {
      survey.surveySwap = surveySwapValue;

      await survey.save();
      surveySwapValue++;
      count++; 
    }

    res.json({ message: `${count} surveys updated successfully!` });
  } catch (error) {
    console.error('Error updating surveys:', error);
    res.status(500).json({ error: 'An error occurred while updating surveys.' });
  }
};

async questiondelete(req, res) {
  try {
    const result = await Survey.updateMany(
      { surveySwap: { $exists: true } },  
      { $unset: { surveySwap: "" } }      
    );

    res.json({ message: `${result.nModified} surveys updated successfully by deleting surveySwap field!` });
  } catch (error) {
    console.error('Error deleting surveySwap field:', error);
    res.status(500).json({ error: 'An error occurred while deleting surveySwap field from surveys.' });
  }
};

async question(req, res) {
  try {
    const result = await Question.updateMany(
      { $set: { responseQuestion: true } } 
    );

    res.status(200).json({
      message: 'All response questions have been updated to true',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update response questions',
      error: error.message
    });
  }
};


async updatesavelinkToSurveyanddelete(req, res) {
  try {
    const { surveyId, surveylink } = req.body;

    if (!surveyId || !surveylink) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "surveyId and surveylink are required",
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

    survey.surveylink = surveylink;
    await survey.save();

    await Responses.deleteMany({ survey_id: surveyId });

    const admin = req.admin;
    await new Notification({
      user_id: admin._id,
      message: `${survey.title} updated successfully - IP: ${
        req.headers["x-forwarded-for"] || req.connection.remoteAddress
      }`,
      title: "Survey updated",
      logo: survey.logo,
      type: "",
    }).save();

    let data = await Notification.find({ user_id: admin._id, read: false })
      .sort({ createdAt: -1 })
      .limit(5);

    EmitData.sendData("new_notification", admin._id, data);

    return res.json({
      status: 200,
      success: true,
      survey,
      message: "Survey updated successfully, and responses deleted.",
    });
  } catch (error) {
    console.log("Error @ updatesavelinkToSurvey: ", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to update survey",
      error: error,
    });
  }
}


}

module.exports = surveyController;
