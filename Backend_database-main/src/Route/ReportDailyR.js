const { Router } = require("express");
const {
  setReportDaily,
  getDataReportsDaily,
  getDataReportsDailyDataById,
  setReportDailyData,
  getAllDataReportsDaily,
  sendReportsManager,
  getDataReportsDailyById,
  getAllDataReportsDailySendReportDaily,
  getDataReportDailyByUserId,
  DeleteReportById,
  DeleteReportDataById,
  setReportDataStatic,
  getDataReportStatic,
  getDataReportStaticById,
  getDataReportStaticTorReportStatic,
  updateReportDataStatic
} = require("../Controller/ReportDailyController ");
const Auth = require("../middleware/auth");

const Route = Router();
Route.post("/setDataDailyReport", setReportDaily);
Route.get("/getAllDataReportsDaily", getAllDataReportsDaily);
Route.get("/getDataReportsDaily/:id", getDataReportsDaily);
Route.get(
  "/getAllDataReportsDailySendReportDaily",
  getAllDataReportsDailySendReportDaily
);

Route.post("/setReportDailyData", setReportDailyData);
Route.get("/getDataReportsDailyDataById/:id", getDataReportsDailyDataById);
Route.put("/sendReportsManager/:id", Auth, sendReportsManager);
Route.get("/getDataReportsDailyById/:id", getDataReportsDailyById);
Route.get("/getDataReportDailyByUserId/:id", getDataReportDailyByUserId);
Route.delete("/DeleteReportById/:id",DeleteReportById)
Route.delete("/DeleteReportDataById/:id",DeleteReportDataById)
Route.post("/setReportDataStatic", setReportDataStatic);
Route.get("/getDataReportStatic", getDataReportStatic);
Route.get("/getDataReportStaticById", getDataReportStaticById);
Route.get("/getDataReportStaticTorReportStatic", getDataReportStaticTorReportStatic);
Route.put("/updateReportDataStatic/:id", updateReportDataStatic);





module.exports = Route;
