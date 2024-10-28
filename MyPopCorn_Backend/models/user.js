const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userScheme = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    Action: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    user_type: {
      type: String,
    },
    user_profile:{
      type: String, 
    },
    address: {
      type: String,
    },
    privatekey: {
      type: String,
    },
    reward_points: {
      type: Number,
      default: 0 
    },
    claimed_reward_points: {
      type: Number,
      default: 0 
    },
    enable2FA: {
      type: Boolean,
      default: false,
    },
    secret2FA: {
      type: String,
    },
    passwordthere: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userScheme.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  return token;
};

userScheme.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email }).select(["-secret2FA"]);
  if (!user) {
    throw new Error("Invalid Credential");
  }
  if (!user.password) {
    throw new Error("Invalid Credential");
  }
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    throw new Error("Invalid Credential");
  }
  return user;
};




const User = mongoose.model("User", userScheme);

module.exports = User;

