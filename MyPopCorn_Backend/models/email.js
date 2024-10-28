const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['EMAIL'],
    default: 'EMAIL',
  },
  toUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Email = mongoose.model('email', emailSchema);

module.exports = Email;

