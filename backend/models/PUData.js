import mongoose from "mongoose";
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
  image: String,
  iD: String,
  imageSetD: String,
  vD: String,
  current: Number,
  mrp: Number,
  packaging: Number,
  shipping: Number,
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
  cancelR: String,
  createdAt: Date,
};
const PUDatas = new mongoose.Schema({
  _id: Number,
  delivered: [dataStructure],
  returned: [dataStructure],
  reqPH: [{ _id: Date, reqPId: String, reqUId: String }], // request Product help
  resB: [{ _id: Date, resPId: String, resBA: Number, resUId: String }], // response bonus
  refB: [{ _id: Date, refPId: String, refBA: Number, refUId: String }], // refer bonus
});

export default mongoose.models.PUData || mongoose.model("PUData", PUDatas);
