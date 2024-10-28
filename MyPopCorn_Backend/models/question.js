const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  survey: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Survey'
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'text'],
    required: true
  },
  options: {
    type: [String], 
    required: function() { return this.questionType === 'multiple_choice'; }
  },
  responseQuestion: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
