const { Router } = require("express");
const {
    getAllDataPermission,
    getPermassionById,
    setPermission,
} = require("../Controller/PermassionController.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setPermission", setPermission);
Route.get("/getPermassionById/:id", getPermassionById);
Route.get("/getAllDataPermission", getAllDataPermission);

module.exports = Route;
