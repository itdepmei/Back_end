const { Router } = require("express");
const {
  getRole,
  setRole,
  getDataRoleIdAndUserId,
  getDataRoleIdAndPermissionId,
  setPermissionAndRole,
  getDataRoleIdAndPermissionIduseGrouID,
  setPermissionAndRoleToEchGroup
} = require("../Controller/RoleController.js");
const Auth = require("../middleware/auth.js");
const Route = Router();
Route.post("/SetRole", setRole);
Route.get("/getRole", getRole);
Route.get("/getDataRoleIdAndUserId/:id", getDataRoleIdAndUserId);
Route.get("/getDataRoleIdAndPermissionId/:id", getDataRoleIdAndPermissionId);
Route.get(
  "/getDataRoleIdAndPermissionIduseGrouID/:id",
  getDataRoleIdAndPermissionIduseGrouID
);
Route.post("/setPermissionAndRole", setPermissionAndRole);
Route.post("/setPermissionAndRoletoEchGroup", setPermissionAndRoleToEchGroup);
module.exports = Route;
