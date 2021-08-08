const mongoose = require("mongoose");
const promotionSchema = mongoose.Schema({
  firstLine: {
    type: String,
    required: true,
  },
  secondLine: {
    type: String,
    required: true,
  },
  thirdLine: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  activePeriod: {
    type: String,
    required: true,
  },
  slogan: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
});

promotionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

promotionSchema.set("toJSON", {
  virtuals: true,
});

exports.Promotion = mongoose.model("Promotion", promotionSchema);
