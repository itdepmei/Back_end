const {
  RegisterUser,
  login,
  getdatabyDepartmentIDName,
  getAllData,
  DeleteUserById,
  updateUser,
  update_image_profile,
  getDataUserById,
} = require("../Controller/UserController.js");
const { Router } = require("express");
const upload  = require("../middleware/upload.js");
const Auth = require("../middleware/auth.js");

const router = Router();
router.post("/addUser", upload.single("image"), RegisterUser);
router.post("/Login", login);
router.get("/getallDataUser/:id", getdatabyDepartmentIDName);
router.get("/getAllData", getAllData);
router.get("/getDataUserById/:id", Auth, getDataUserById);
router.delete("/deleteUserById/:id", DeleteUserById);
router.put("/updateUserById/:id", Auth, updateUser);
router.put(
  "/update_image_profile",
  Auth,
  upload.single("image"),
  update_image_profile
);

module.exports = router;
