const { Schema, model } = require("mongoose");

const MutualProjectSchema = new Schema(
  {
    ProjectManger: { type: Schema.Types.ObjectId, ref: "users" },
    userIdInsertProject: { type: Schema.Types.ObjectId, ref: "users" },
    common: { type: Boolean, default: false },
    DepartmentID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const MutualProject = model("MutualProject", MutualProjectSchema);
const SendProjectMutualSchema = new Schema(
  {
    DepartmentID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],
    dataProjectId: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  {
    timestamps: true,
  }
);
const SendProjectMutual = model("SendProjectMutual", SendProjectMutualSchema);

const SendProjectMutualToSendEmploySchema = new Schema(
  {
    userId: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    dataProjectId: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  {
    timestamps: true,
  }
);
const SendProjectMutualToSendEmploy = model(
  "SendProjectMutualToSendEmploy",
  SendProjectMutualToSendEmploySchema
);
module.exports = {
  MutualProject,
  SendProjectMutual,
  SendProjectMutualToSendEmploy,
};
