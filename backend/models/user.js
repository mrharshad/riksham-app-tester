import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
const dataStructure = {
  _id: Number,
  pId: Number,
  name: String,
  tOfP: String,
  address: String,
  district: String,
  state: String,
  pinCode: Number,
  mNumber: Number,
  cancelR: String,
  image: String,
  iD: String,
  imageSetD: String,
  vD: String,
  current: Number,
  mrp: Number,
  packaging: Number,
  shipping: Number,
  status: String,
  statusUP: Date,
  qty: Number,
  tofPay: {
    type: String,
    enum: [
      "Cash on Delivery / Pay on Delivery",
      "Just Delivery / Packaging Charge",
      "Full Payment",
    ],
  },
  createdAt: Date,
  expectD: String,
};
const User = new mongoose.Schema(
  {
    _id: Number,
    fName: {
      required: [true, "please enter your first name"],
      trim: true,
      type: String,
      maxLength: [30, "first Name cannot exceed 30 characters"],
    },
    lName: {
      required: [true, "please enter your last name"],
      trim: true,
      type: String,
      maxLength: [30, "lastName cannot exceed 30 characters"],
    },
    email: {
      type: String,
      // validate: [validator.isEmail],
      required: [true, "please enter your email"],
      trim: true,
      unique: true,
    },
    password: {
      select: false,
      type: String,
      trim: true,
      minLength: [8, "password should be greater than 8 characters"],
    },
    mobileNo: {
      type: Number,
      required: [
        true,
        "Please enter your mobile number so that we can contact you",
      ],
    },
    role: [String],

    // "User"
    // "Product deil , Set Qty, and Price  Manager" => S D_&_P  M
    // "Product District Stock and Order Manager"  => P D S_&_O M
    // "Product information Create, read, update" => => P I C_&_R_&_U_&_D

    address: {
      type: String,
      minLength: [10, "Address should have more than 10 characters"],
      maxLength: [50, "Address cannot exceed 50 characters"],
    },
    pinCode: Number,
    state: String,
    district: String,

    cartPro: [
      {
        _id: false,
        cPN: String,
        cPiD: String,
        cPvD: String,
        cPAddAt: String,
      },
    ],
    gender: String,
    bDate: Number,
    bMonth: Number,
    bYear: Number,
    newOrder: [dataStructure],
    canceled: [dataStructure],
    reOSP: [{ _id: Date, opt: String }], // isme data tabhi ayega jab user ka order delivered hoga _id me product ka aLife ke 3x aghe ka life date set rahega
    // 0PT = order product type , opc = order product category , opN = order product name
    sugPC: [],
    // default: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
    token: String,
    tokenExpire: Date,
    verificationFailed: Number,
    tokensSent: Number,
    holdOnToken: Date,
    holdOnVerification: Date,
    createdAt: String,
  }
  // { versionKey: false }
);

// _________________________________________
// forgot password
// User.methods.resetPassword = function () {
//   const randomString = crypto.randomBytes(20).toString("hex");

//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(randomString)
//     .digest("hex");
//   this.restPasswordExpire = Date.now() + 15 * 60 * 1000;
//   return randomString;
// };
// ___________________________________________

// agar models me user collection pahale se hai to hum uska use karege anyatha new collection create karege

export default mongoose.models.User || mongoose.model("User", User);
