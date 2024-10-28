const mongoose = require("mongoose");

const trasactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  coin: {
    type: String,
  },
  transaction_status: {
    type: String,
  },
  status: {
    type: String,
  },
  amount: {
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

const transaction = mongoose.model("transaction", trasactionSchema);

module.exports = transaction;
