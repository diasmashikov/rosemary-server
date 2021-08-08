const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  phoneNumbers: [
    {
      type: String,
      required: true,
    },
  ],
  socialMedias: [
    {
      type: String,
      required: true,
    },
  ],
  workingSchedule: {
    type: String,
    required: true,
  },
});

exports.Contact = mongoose.model("Contact", contactSchema);
