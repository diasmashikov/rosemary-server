const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  color: {
    type: String,
    required: true,
  },
  sizes: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  countryProducer: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  modelCharacteristics: {
    modelHeight: {
      type: Number,
    },
    modelWeight: {
      type: Number,
    },
    modelSize: {
      type: String,
    },
  },
  discount: {
    type: Number,
    default: 0.0
  },
  fashionCollection: {
    type: String,
    default: "Все"
  },
  newArrival: {
    type: Boolean, 
    default: true,
  },
  recommended: {
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 1000,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", {
  virtuals: true,
});

exports.Product = mongoose.model("Product", productSchema);
