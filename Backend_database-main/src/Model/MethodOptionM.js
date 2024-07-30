const { Schema, model } = require("mongoose");

const MethodOptionSchema = new Schema(
  {
    MethodOption: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const MethodOptionModel = model("MethodOption", MethodOptionSchema);

module.exports = MethodOptionModel;
