const { Router } = require("express");
const { setWorkNatural, getData ,deleteById} = require("../Controller/WorkNaturalController.js");

const Route = Router();
Route.post("/setWorkNatural", setWorkNatural);
Route.get("/getDataNatural", getData);
Route.delete("/deleteByIdWorkN/:id",deleteById)

module.exports = Route;
