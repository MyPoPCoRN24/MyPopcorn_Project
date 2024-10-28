const mongoose = require('mongoose');

var SiteSettingsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  key: {
    type: String,
    unique: true,
    required: true
  },
  value: {
    type: String
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'url', 'select', 'toggle', 'description', 'date', 'email', 'radio', 'tel', 'number'],
    default: "text"
  },
  secure: {
    type: Boolean,
    default: false
  },
  notification: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

var SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);

module.exports = SiteSettings;