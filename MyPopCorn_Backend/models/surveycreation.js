const mongoose = require('mongoose');
const Question = require('./question'); 

const SurveySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  logo: {
    type: String, 
  },
  title: {
    type: String, 
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  surveylink: {
    type: String,
  },
  reward_points: {
    type: Number, 
  },
  createdby: {
    type: String, 
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }], 
  surveyresponse: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response'
  }], 
  status: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  surveySwap: {
    type: Number
  }
}, { timestamps: true });

const Survey = mongoose.model('Survey', SurveySchema);

module.exports = Survey;

