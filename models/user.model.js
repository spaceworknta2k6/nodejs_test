const mongoose = require("mongoose");
const generate = require("../helper/generate");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    token: {
      type: String,
      default: () => generate.generateRandomString(32),
    },
    status: {
      type: String,
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
