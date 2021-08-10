const mongoose = require("mongoose");

const askedQuestionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

askedQuestionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

askedQuestionSchema.set("toJSON", {
  virtuals: true,
});

exports.AskedQuestion = mongoose.model("AskedQuestion", askedQuestionSchema);
