const { Router } = require("express");
const {
  setNotes,
  getDataNotes,
  deleteByIdNotes,
} = require("../Controller/NotesContrroler.js");
const Auth = require("../middleware/auth.js");

const Route = Router();
Route.post("/setNotes", setNotes);
Route.get("/getDataNotes", getDataNotes);

module.exports = Route;
