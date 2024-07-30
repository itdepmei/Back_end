const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const MessagingCompanySchema = new Schema(
  {
    NameCompany: { type: String, required: true },
    contract: { type: String, required: true },
    payment: { type: String, required: true },
    deliveryOver: { type: String, required: true },
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

const MessagingCompanyModel = model("MessagingCompany", MessagingCompanySchema);
module.exports = MessagingCompanyModel;
