const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reward_points: {
    type: String,
  },
  isclaimed: {
    type: Boolean,
      default: false,
  },
  status: {
    type: String,
  },
  from_address: {
    type: String,
  },
  to_address: {
    type: String,
  },
  transaction_id: {
    type: String,
  },
},
{ timestamps: true }
);

const rewardmodel = mongoose.model("reward", rewardSchema);

module.exports = rewardmodel;
