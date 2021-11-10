const mongoose = require("mongoose");



const smsValidationSchema = mongoose.Schema({
  validationCode: {
    type: Number,
    required: true,
  },

});

smsValidationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

smsValidationSchema.set("toJSON", {
  virtuals: true,
});

exports.SmsValidation = mongoose.model("SmsValidation", smsValidationSchema);
