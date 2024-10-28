const mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
    user_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    logo:{
        type: String,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    notificationType:{
     type:String,
     enum:['PUSH','MAIL', 'PUSH&MAIL']
    },
  
    type: {
        type: String,
    },
    isAdmin:{
     type:Boolean,
     default:false
    },
    userArray:{
     type:Array
    },
}, { timestamps: true });

var notification = mongoose.model('notification', notificationSchema);

module.exports = notification;