const { Router } = require("express");
const { setMinistries, getData } = require("../Controller/MinistriesController.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setMinistries", setMinistries);
Route.get("/getData", getData);

module.exports = Route;
