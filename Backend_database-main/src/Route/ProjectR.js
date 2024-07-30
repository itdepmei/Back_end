const { Router } = require("express");
const {
  SetProject,
  getallDataByDepartmentAndUserID,
  deleteById,
  getDataByUserId,
  getAllData,
  getProjectById,
  getDataProjectById,
  updateDataProjectById,
  getDateAsFileExcel,
  sendProject,
  getDataBySendUserProjectAndProduct,
  CancelSendProject,
  setDataAsPdf,
  sendProjectToManager,
  getDataHasBeenSendByDepartmentToManger,
  getDataFileINMangerSection,
  delayProjectFinaltime,
  getAllDataByDepartmentAndUserIDWhenDelayCheckIsTrue,
  setProjectCommon,
  getDataAllByIdProjectMutual,
  getNumberOfProjectsCurrently,
  setDataAsPdfHtmlPdf,
  getDataByDepartmentMutualId,
  setDataAsPdfTest,
  getDataMutualProjectBYUserId,
  getDataAllByIdProjectMutualDelay,
  CancelSendProjectDelay,
  getallDataByDepartmentQuantityTable,
  updateDataPriceProjectTotal,
  getDataAllProjectHasCompleted,
  getallDataByDepartmentIdCheckMethodOption,
  IsCompleteProjectInsertData,
} = require("../Controller/ProjectController.js");
const Auth = require("../middleware/auth.js");
const router = Router();
router.post("/setProject", Auth, SetProject);
router.get("/getProjects", Auth, getallDataByDepartmentAndUserID);
router.delete("/deleteProject/:id", Auth, deleteById);
router.get("/getDataByUserID",Auth, getDataByUserId);
router.get("/getallDataProject", getAllData);
router.get("/getProjectById/:id", getProjectById);
router.get("/getDataProjectById/:id", getDataProjectById);
router.put("/updateDataProjectById/:id", Auth, updateDataProjectById);
router.get("/getDateAsFileExcel", Auth, getDateAsFileExcel);
router.put("/sendProject/:id", Auth, sendProject);
router.put("/CancelSendProject/:id", Auth, CancelSendProject);
router.get(
  "/getDataBySendUserProjectAndProduct/:id",
  getDataBySendUserProjectAndProduct
);
router.post("/setDataAsPdf", setDataAsPdfHtmlPdf);
router.put("/sendProjectToManger/:id", Auth, sendProjectToManager);
router.get(
  "/getDataHasBeenSendByDepartmentToManger",
  Auth,
  getDataHasBeenSendByDepartmentToManger
);
router.get("/getDataFileINMangerSection/:id", Auth, getDataFileINMangerSection);
router.get(
  "/getallDataByDepartmentAndUserIDWhendelayCheckIsTure",
  Auth,
  getAllDataByDepartmentAndUserIDWhenDelayCheckIsTrue
);
router.put("/delayProjectFinaltime/:id", Auth, delayProjectFinaltime);
router.post("/setProjectCommon", Auth, setProjectCommon);
router.get("/getDataAllByIdProjectMutual", Auth, getDataAllByIdProjectMutual);
router.get(
  "/getDataAllByIdProjectMutualDelay",
  Auth,
  getDataAllByIdProjectMutualDelay
);
router.get("/getNumberOfProjectsCurrently", getNumberOfProjectsCurrently);
router.get("/getDataByDepartmentMutualId", getDataByDepartmentMutualId);
router.put("/CancelSendProjectDelay/:id", Auth, CancelSendProjectDelay);
router.get("/getDataMutualProjectBYUserId", Auth, getDataMutualProjectBYUserId);
router.get(
  "/getallDataByDepartmentQuantityTable",
  Auth,
  getallDataByDepartmentQuantityTable
);
router.get("/updateDataPriceProductTotal", Auth, updateDataPriceProjectTotal);
router.get(
  "/getDataAllProjectHasCompleted",
  Auth,
  getDataAllProjectHasCompleted
);
router.get(
  "/getallDataByDepartmentIdCheckMethodOption",

  getallDataByDepartmentIdCheckMethodOption
);
router.put(
  "/IsCompleteProjectInsertData/:id",
  Auth,
  IsCompleteProjectInsertData
);
module.exports = router;
