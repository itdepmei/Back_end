const { Schema, model } = require("mongoose");

const WorkNaturalSchema = new Schema(
  {
    workNaturalData: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const WorkNatural = model("WorkNatural", WorkNaturalSchema);

module.exports = WorkNatural;
