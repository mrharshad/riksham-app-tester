import mongoose from "mongoose";
// const validator = require("validator");
const Product = new mongoose.Schema(
  {
    _id: Number,
    name: {
      type: String,
      unique: true,
    },
    brand: String,
    tOfP: String,
    category: String,
    des1: String,
    des2: String,
    des3: String,
    description: [String],
    keyValueD: [String],
    aInfo: [String],
    payType: [String],
    tOfDelivery: [String],

    imageSetD: String,
    imgSetPD: Boolean,
    thumbnail: { thumbId: String, thumbUrl: String },
    imageSets: [
      {
        _id: false,
        iSN: String,
        images: [
          {
            _id: false,
            imgId: String,
            url: String,
          },
        ],
      },
    ],
    variantD: String,
    variants: [
      {
        _id: false,
        vD: String, // variant diffrence
        disOpt: [
          {
            _id: false,
            min: Number,
            dis: Number,
          },
        ], // agar 5 diye hai to user order karne ke liye 5 qty set karta hai to second discond apply hoga 10 karta hai to third vala
        options: [
          {
            _id: false,
            optID: String,
            purchased: Number, // mere ko kitna perecent discount mill raha hai
            mrp: Number,
            loc: [
              {
                _id: false,
                s: String,
                d: [String],
              },
            ],
          },
        ],
      },
    ],
    certificate: [
      {
        _id: false,
        cN: String,
        cImages: [String],
      },
    ],

    varKVD: {
      type: Object,
    }, // key variant ka naam aur value me object jisme key value me data hoga
    varOpt: [
      {
        _id: false,
        voName: String, // variant-option
        seller: [{ _id: Number, UpdateP: Date, SellingP: Number }],
        updates: [
          {
            _id: false,
            uTime: Date,
            uId: Number,
            uValues: {}, // old key value ko store krna hai
          },
        ],
      },
    ],
    popular: {
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
    createdAt: Date,
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
