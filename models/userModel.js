const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const userType = require("../models/enums/userType");
const status = require("../models/enums/status");

const users = Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      unique: true,
      required: true,
    },

    dateOfBirth: {
      type: String,
    },
    otp: {
      type: Number,
    },
    isVarified: {
      type: Boolean,
      default: false,
    },

    expirationTime: {
      type: Date,
    },
    userType: {
      type: String,
      default: userType.USER,
    },
    status: {
      type: String,
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);
module.exports = model("user", users, "user");

const admin = async () => {
  const adminData = await model("user", users).find({
    userType: userType.ADMIN,
  });
  if (adminData.length !== 0) {
    console.log("admin already present");
  } else {
    let obj = {
      firstName: "Ad",
      lastName: "Admin",
      mobileNumber: 7985853064,
      email: "Abhijeetrai415@gmail.com",
      password: bcrypt.hashSync("admin@112", 10),
      dateOfBirth: "28-06-2002",
      userType: userType.ADMIN,
      status: status.ACTIVE,
      isVarified: "true",
    };
    const result = await model("user", users).create(obj);
    console.log("admin created. ", result);
  }
};
admin();
