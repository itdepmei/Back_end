const { Router } = require("express");
const {
  sendProjectFromHodToProjectManger,
  getDataAllCheckByDepartmentId,
  sendProjectMutualToEmploy,
  getDataAllCheckByUserIdforEmploy
} = require("../Controller/ProjectMutualController");
const Auth = require("../middleware/auth");

const Route = Router();
Route.put(
  "/sendProjectFromHodToProjectManger/:id",
  Auth,
  sendProjectFromHodToProjectManger
);
Route.get("/getDataAllCheckByDepartmentId/:id", getDataAllCheckByDepartmentId);
Route.put("/sendProjectMutualToEmploy/:id", Auth ,sendProjectMutualToEmploy);
Route.get("/getDataAllCheckByUserIdforEmploy/:id",getDataAllCheckByUserIdforEmploy);

module.exports = Route;
