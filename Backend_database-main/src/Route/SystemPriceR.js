const { Router } = require("express");
const {
  setPriceINUsd,
  getDataSystemPrice,
  deleteByIdSystemPrice,
} = require("../Controller/SystemPriceController.js");

const Route = Router();
Route.post("/setSystemPrice", setPriceINUsd);
Route.get("/getDataSystemPrice", getDataSystemPrice);
Route.delete("/deleteByIdSystemPrice", deleteByIdSystemPrice);

module.exports = Route;
