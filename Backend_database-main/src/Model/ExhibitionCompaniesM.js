const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const exhibitionCompanySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    notes: { type: String, required: true },
    companyName: { type: String, required: true },
    departmentID: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  },
  {
    timestamps: true,
  }
);

const exhibitionCompanyModel = model("exhibitionCompanyModel", exhibitionCompanySchema);
module.exports = exhibitionCompanyModel;
