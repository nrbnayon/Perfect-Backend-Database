const mongoose = require("mongoose");

const passwordCollectModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectID,
      required: true,
    },
    passRef: {
      type: String,
      required: true,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PasswordCollectModel = mongoose.model("Passref", passwordCollectModel);

module.exports = PasswordCollectModel;
