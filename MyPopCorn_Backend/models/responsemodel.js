const mongoose = require('mongoose');
const Survey = require('./surveycreation'); // Import Survey model
const User = require('./user'); // Import User model
const Admin = require('./admin'); // Import Admin model
const Question = require('./question'); // Import Question model

const ResponseSchema = new mongoose.Schema({
  survey_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['Answered', 'Partially answered'],
    default: 'Partially answered'
  },
},
{ timestamps: true }
);

ResponseSchema.pre('save', async function (next) {
  const response = this;

  try {
    for (let i = 0; i < response.answers.length; i++) {
      const answer = response.answers[i];
      const questionId = answer.question_id;

      const question = await Question.findById(questionId);

      if (question) {
        if (!question.responseQuestion) {
          question.responseQuestion = true;
          await question.save();
          console.log(`Updated question ${questionId} with responseQuestion: true`);
        }
      }
    }

    if (response.status === 'Answered') {
      const survey = await Survey.findById(response.survey_id);

      if (survey) {
        const rewardPoints = survey.reward_points;

        await User.findByIdAndUpdate(
          response.user_id,
          { $inc: { reward_points: rewardPoints } },
          { new: true }
        );

        await Admin.findOneAndUpdate(
          {}, 
          { $inc: { reward_points_given: rewardPoints } },
          { new: true }
        );

        console.log(`Added ${rewardPoints} reward points to user ${response.user_id}`);
      }
    }
  } catch (error) {
    console.error('Error in updating responseQuestion field or reward distribution:', error);
    return next(error);
  }

  next();
});


const Response = mongoose.model('Response', ResponseSchema);

module.exports = Response;

