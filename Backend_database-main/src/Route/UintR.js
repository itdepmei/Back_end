const { Router } = require("express");
const {
  setUnit,
  getDataSystemUnit
} = require("../Controller/UnitSystemController.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setSystemUnit", setUnit);
Route.get("/UnitSystemShowData", getDataSystemUnit);

module.exports = Route;
