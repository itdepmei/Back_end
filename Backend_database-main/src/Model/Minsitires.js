const { Schema, model } = require("mongoose");

const MinistriesSchema = new Schema(
  {
    ministries: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Ministries = model("Ministries", MinistriesSchema);

module.exports = Ministries;
