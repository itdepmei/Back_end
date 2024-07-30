const mongoose = require("mongoose");
const { Schema } = mongoose;
const schemaReportDaily = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    timeReport: {
      type: Date,
      default: Date.now,
      // expires: "7d",
    },
    SendReportDaily: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const ReportsDaily = mongoose.model("ReportDaily", schemaReportDaily);

const schemaReportDailyData = new Schema(
  {
    ReportsDailyId: { type: Schema.Types.ObjectId, ref: "ReportDaily" },
    SelectTask: { type: String, default: "otherWork" },
    timFrom: { type: Date, default: null },
    timTo: { type: Date, default: null },
    taskDescription: { type: String },
    Notes: { type: String },
  },
  { timestamps: true }
);
const ReportsDailyData = mongoose.model(
  "ReportDailyData",
  schemaReportDailyData
);
const schemaReportStatic = new Schema(
  {
    ReportsDailyId: { type: Schema.Types.ObjectId, ref: "ReportDaily" },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    taskDescriptionStatic: { type: String },
  },
  { timestamps: true }
);
const ReportsDailyDataStatic = mongoose.model(
  "ReportsDailyDataStatic",
  schemaReportStatic
);
const schemaReportInsertStaticData = new Schema(
  {
    ReportsDailyId: { type: Schema.Types.ObjectId, ref: "ReportDaily" },
    ReportStaticId:{ type: Schema.Types.ObjectId, ref: "ReportsDailyDataStatic" },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    Notes: { type: String, default: "لايوجد" },
  },
  { timestamps: true }
);
const ReportInsertStaticData = mongoose.model(
  "ReportsInsertDataStatic",
  schemaReportInsertStaticData
);
module.exports = {
  ReportsDaily,
  ReportsDailyData,
  ReportsDailyDataStatic,
  ReportInsertStaticData,
};
