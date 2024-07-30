const { Schema, model } = require("mongoose");

const DepartmentSchema = new Schema(
  {
    departmentName: { type: String, required: true },
    brief: { type: String },
    sendProject: { type: Schema.Types.ObjectId, ref: "UploadFile" },
    reciveProject: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Department = model("Department", DepartmentSchema);

module.exports = Department;
