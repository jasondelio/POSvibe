const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imgData: {
      imgUrl: {
        type: String,
      },
      fileName: {
        type: String,
      },
      fileExt: {
        type: String,
      },
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
