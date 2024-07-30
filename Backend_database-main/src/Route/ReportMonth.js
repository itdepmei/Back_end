const { Router } = require("express");

const Auth = require("../middleware/auth");
const {
  setReportMonth,
  getDataReportsMonthByUserID,
  getDataReportsMonthDataById,
  getDataReportsMonthById,
  getDataReportsMonthDataByIdEachFild,
  updateDataReportMonthById,
  getAllDataReportsMonthtsend,
  sendReportsManager,
  DeleteReportById
} = require("../Controller/reportMonthController");

const Route = Router();
Route.post("/setReportMonth", setReportMonth);
Route.get("/getDataReportsMonthByUserID/:id", getDataReportsMonthByUserID);
Route.get("/getDataReportsMonthById/:id", getDataReportsMonthById);

Route.get("/getDataReportsMonthDataById/:id", getDataReportsMonthDataById);
Route.get(
  "/getDataReportsMonthDataByIdEachFild/:id",
  getDataReportsMonthDataByIdEachFild
);
Route.put("/updateDataReportMonthById/:id", updateDataReportMonthById);
Route.get("/getAllDataReportsMonthtsend", getAllDataReportsMonthtsend);
Route.put("/sendReportsMonthManager/:id", Auth, sendReportsManager);
Route.delete("/DeleteReportMonthById/:id", DeleteReportById);


module.exports = Route;
