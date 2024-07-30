const mongoose = require("mongoose");
const { Schema } = mongoose;
const schemaReportMonth = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    createdAt: {
      type: Date,
      default: Date.now,
      // expires: "7d",
    },
    SendReportMonth: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const ReportsMonth = mongoose.model("ReportMonth", schemaReportMonth);
const schemaReportMonthData = new Schema(
  {
    ReportsMonthId: { type: Schema.Types.ObjectId, ref: "ReportMonth" },
    NumberTask: { type: Number, default: 0 },
    taskDescription: { type: String },
    SelectTask: { type: String, default: "otherWork" },
    Notes: { type: String, default: "لايوجد" },
  },
  { timestamps: true }
);
const ReportsMonthData = mongoose.model(
  "ReportMonthData",
  schemaReportMonthData
);
module.exports = { ReportsMonth, ReportsMonthData };
