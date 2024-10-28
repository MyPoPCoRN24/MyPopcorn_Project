const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
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
    enable2FA: {
      type: Boolean,
      default: false,
    },
    tokenaddress: {
      type: String,
    },
    web3url: {
      type: String,
    },
    secret2FA: {
      type: String,
    },
    reward_points_given: {
      type: Number,
      default: 0 
    },
    total_redeem_token: {
      type: Number,
      default: 0 
    },
  },
  { timestamps: true }
);

adminSchema.methods.generateAuthToken = async function () {
  const admin = this;
  const token = await jwt.sign(
    { _id: admin._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};

adminSchema.statics.findByCredentials = async (email, password) => {
  const admin = await Admin.findOne({ email: email }).select(["-secret2FA"]);
  if (!admin) {
    throw new Error("Invalid Credential");
  }
  if (!admin.password) {
    throw new Error("Invalid Credential");
  }
  const check = await bcrypt.compare(password, admin.password);
  if (!check) {
    throw new Error("Invalid Credential");
  }
  return admin;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
