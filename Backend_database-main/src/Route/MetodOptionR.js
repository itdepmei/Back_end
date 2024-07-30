const { Router } = require("express");
const {
  setMethodOption,
  getDataMethodOption,
  deleteMethodOptionById
} = require("../Controller/MethodOptionControoler.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setMethodOption", setMethodOption);
Route.get("/getDataMethodOption", getDataMethodOption);
Route.delete("/deleteMethodOptionById/:id", deleteMethodOptionById);


module.exports = Route;
