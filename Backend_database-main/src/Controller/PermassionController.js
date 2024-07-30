const PermissionModel = require("../Model/Permassion.js");
const setPermission = async (req, res) => {
  try {
    const { permissionName } = req.body;
    console.log(req.body);
    if (!permissionName) {
      return res.status(400).json({ message: "data is required" });
    }
    const PermissionSave = new PermissionModel({
      permissionName,
    });
    const response = await PermissionSave.save();
    return res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "error", e });
  }
};
const getPermassionById = async (req, res) => {
  try {
    const RoleId = req.param("id");
    const response = await PermissionModel?.find({ RoleId });
    if (response) {
      return res.status(200).json({ response });
    }
    return res.status(404).json({ message: "no data found in this role" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "error", e });
  }
};
const getAllDataPermission = async (req, res) => {
  try {
    const response = await PermissionModel.find();
    if (!response) {
      return res.status(404).json({ message: "no data found" });
    }
    return res.status(200).json({ response });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "error", e });
  }
};
module.exports = { getAllDataPermission, getPermassionById, setPermission };
