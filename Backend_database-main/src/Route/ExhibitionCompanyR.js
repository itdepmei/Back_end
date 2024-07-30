const { Router } = require("express");
const { setExhibitionCompanyModel, getExhibitionCompanyModel } = require("../Controller/exhibitionCompanyController.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setExhibitionCompanyModel", setExhibitionCompanyModel);
Route.get("/getExhibitionCompanyModel", getExhibitionCompanyModel);

module.exports = Route;
