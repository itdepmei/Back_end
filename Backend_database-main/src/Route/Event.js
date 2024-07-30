const { Router } = require("express");
const { getEvent } = require("../Controller/EventController.js");

const rout = Router();
rout.get("/getEvent/:id", getEvent);

module.exports = rout;
