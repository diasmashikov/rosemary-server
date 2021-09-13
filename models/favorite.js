const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

favoriteSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

favoriteSchema.set("toJSON", {
  virtuals: true,
});

exports.Favorite = mongoose.model("Favorite", favoriteSchema);
