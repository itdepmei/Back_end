const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const beneficiarySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    notes: { type: String, required: true },
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

const BeneficiaryM = model("beneficiaryModel", beneficiarySchema);
module.exports = BeneficiaryM;
