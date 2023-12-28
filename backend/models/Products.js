import mongoose from "mongoose";
// const validator = require("validator");
const Product = new mongoose.Schema(
  {
    _id: Number,
    name: {
      type: String,
      unique: true,
    },
    category: String,
    brand: String,
    tOfP: String,
    description: [String],
    keyValueD: [Array],
    aInfo: [Array],
    shipping: Number,
    packaging: Number,
    payType: [String],
    everyPC: Boolean,
    imageSetD: String,
    imgSetPD: Boolean,
    imageSets: [
      {
        _id: false,
        iD: String,
        images: [
          {
            _id: false,
            public_id: String,
            url: String,
          },
        ],
      },
    ],
    variantD: String,
    variantPD: Boolean,
    notMS: Boolean, // not modified stock
    variants: [
      {
        _id: false,
        vD: String, // variant diffrence
        varKVD: [Array],
        aLife: Number,
        options: [
          {
            _id: false,
            optID: String,
            purchased: Number,
            mrp: Number,
            current: Number,
            loc: [
              {
                _id: false,
                s: String,
                d: [
                  {
                    _id: false,
                    qty: Number,
                    dN: String,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    spo: {
      type: Number,
      sparse: true,
    },

    rating: Number,
    nOfB: Number,
    rInP: [Number],
    buyers: [
      {
        _id: Number,
        bN: {
          type: String,
        },
        bS: String,
        bD: String,
        bR: {
          type: Number,
          max: 5,
          min: 1,
        },
        bC: String,
        dDate: String,
      },
    ],
    createdAt: String,
  }

  // { versionKey: false }
);

// Product.index(
//   // index create karne ke liye
//   {
//     name: 1,
//   },
//   { unique: true }
// );

export default mongoose.models.Product || mongoose.model("Product", Product);
