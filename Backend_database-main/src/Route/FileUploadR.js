const { Router } = require("express");
const {
  setFileUpload,
  getAllfile,
  getDataAllById,
  sendProjectToDepartment,
  getDataFileUploadBySelectTheIdFromHrTOdEPARTMENT,
  CheckDataUserSend,
  getDataAllCheckUserByById,
  getDataFileBySendFilefromHOD,
  deleteTheFileById,
} = require("../Controller/uploadFileContriller.js");
const upload = require("../middleware/upload.js");
const Auth = require("../middleware/auth.js");
const route = Router();
route.post("/setFileUpload", Auth, upload.single("file"), setFileUpload);
route.get("/getAllFiles", Auth, getAllfile);
// route.put("/sendProjectToDepartmentSelectByHr/:id",sendProjectToDepartmentSelectByHr)
route.put("/sendProjectToDepartment/:id", Auth, sendProjectToDepartment);
route.get("/getDataAllById/:id", getDataAllById);
route.get(
  "/getDataFileUploadBySelectTheIdFromHrTOdEPARTMENT/:id",
  getDataFileUploadBySelectTheIdFromHrTOdEPARTMENT
);
route.put("/CheckDataUserSend/:id", Auth, CheckDataUserSend);
route.get("/getDataAllCheckUserByById/:id", getDataAllCheckUserByById);
route.get("/getDataFileBySendFilefromHOD/:id", getDataFileBySendFilefromHOD);
route.delete("/deleteTheFileById/:id", deleteTheFileById);
module.exports = route;
