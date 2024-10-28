const mongoose = require('mongoose');

const SurveySwarmSchema = new mongoose.Schema({
  survey_creator: {
    type: String,
    required: true,
  },
  survey_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
  },
  swarm_reference: {
    type: String,
    required: true,
  },
  asset_id:{
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const SurveySwarm = mongoose.model('SurveySwarm', SurveySwarmSchema);

module.exports = SurveySwarm;
