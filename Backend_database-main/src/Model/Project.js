const { Schema, model } = require("mongoose");

const ProjectSchema = new Schema(
  {
    nameProject: String,
    NumberBook: { type: String, default: "none" },
    DateBook: { type: Date, default: Date.now },
    DateClose: { type: Date, default: Date.now },
    beneficiary: String,
    comments: { type: String, default: " لايوج" },
    WorkNatural: { type: Schema.Types.ObjectId, ref: "WorkNatural" },
    MethodOption: { type: Schema.Types.ObjectId, ref: "MethodOption" },
    Stage: String,
    LevelPerformance: String,
    CompletionRate: String,
    userId: { type: Schema.Types.ObjectId, ref: "users", default: null },
    userIdOfHOd: { type: Schema.Types.ObjectId, ref: "users", default: null },
    ManyPersonChrgeId: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null,
      },
    ],

    DepartmentID: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    MutualProjectId: {
      type: Schema.Types.ObjectId,
      ref: "MutualProject",
    },
    Code: {
      type: String,
      required: true,
    },
    OfferPrice: { type: Number, default: 1 },
    SendProject: { type: Boolean, default: false },
    SendProjectMutual: { type: Boolean, default: false },
    dateSendTHod: {
      type: Date,
      default: Date.now,
    },
    sendProjectToManger: { type: Boolean, default: false },
    dateSendToManger: {
      type: Date,
      default: Date.now,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: "",
    },
    delayProjectCheck: {
      type: Boolean,
      default: false,
    },
    isCompleteProject: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Project = model("Project", ProjectSchema);
module.exports = Project;
