const { Router } = require("express");
const { setData, getData, getDataByID, deleteById } = require("../Controller/DepartmentController.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setData/Department", setData);
Route.get("/getData/Department", getData);
Route.get("/getDataById/:id", getDataByID);
Route.delete("/deleteDepartmentById/:id", deleteById);

module.exports = Route;
